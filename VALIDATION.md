# Drop.js SDK Input Validation

## Overview

The Drop.js SDK now includes comprehensive input validation to protect against common configuration errors, server overload, and browser crashes. Validation runs at initialization and throws clear `ValidationError` exceptions for invalid configurations.

## Validation Rules

| Parameter | Constraint | Default | Rationale |
|-----------|-----------|---------|-----------|
| **clientSecret** | Min 10 chars, must start with `pi_secret_` | Required | Catches authentication errors early |
| **qrSize** | 128-1024 pixels | 256 | Below 128 = hard to scan; above 1024 = memory issues |
| **pollingInterval** | 1000-60000 ms | 3000 | Prevents server DOS; maintains real-time UX |
| **cornerRadius** | 0-1 | 0 | QR libraries use 0-1 range |
| **moduleColor** | Valid color format | `hsl(160, 65%, 25%)` | Must be hex, rgb, rgba, hsl, or hsla |
| **backgroundColor** | Valid color format | `hsl(0, 0%, 98%)` | Must be hex, rgb, rgba, hsl, or hsla |
| **linkText** | Max 100 characters | "Or paste this link:" | Prevents UI layout breaking |
| **onStatusChange** | Function or undefined | undefined | Type safety for callbacks |
| **onError** | Function or undefined | undefined | Type safety for callbacks |
| **onPoll** | Function or undefined | undefined | Type safety for callbacks |

## Supported Color Formats

Valid color formats include:
- **Hex**: `#000`, `#000000`, `#AbC123`
- **RGB**: `rgb(0, 0, 0)`, `rgb(255, 128, 64)`
- **RGBA**: `rgba(0, 0, 0, 1)`, `rgba(255, 128, 64, 0.5)`
- **HSL**: `hsl(0, 0%, 0%)`, `hsl(240, 100%, 50%)`
- **HSLA**: `hsla(0, 0%, 0%, 1)`, `hsla(240, 100%, 50%, 0.5)`

Color values are validated to ensure they're within valid ranges (e.g., RGB values must be 0-255).

## Usage

### Valid Configuration

```javascript
import { Drop } from '@drop-africa/drop-js';

const instance = await Drop.create({
  clientSecret: 'pi_secret_1234567890abcdef',
  instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
  containerId: 'qr-container',
  qrSize: 512,
  pollingInterval: 5000,
  qrOptions: {
    cornerRadius: 0.5,
    moduleColor: '#00796B',
    backgroundColor: '#F5F5F5'
  },
  linkText: 'Scan or paste this link',
  onStatusChange: (status) => console.log(status),
  onError: (error) => console.error(error)
});
```

### Error Handling

```javascript
import { Drop, ValidationError } from '@drop-africa/drop-js';

try {
  const instance = await Drop.create({
    clientSecret: 'invalid',  // Too short and wrong prefix
    instanceUrl: '...',
    containerId: 'qr'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Configuration error:', error.message);
    // Output: "clientSecret must be at least 10 characters long. Received length: 7"
  }
}
```

### Common Validation Errors

```javascript
// Empty clientSecret
Drop.create({ clientSecret: '', ... })
// Error: "clientSecret is required and cannot be empty"

// Invalid clientSecret prefix
Drop.create({ clientSecret: 'sk_test_1234567890', ... })
// Error: "clientSecret must start with 'pi_secret_'. Received: sk_test_12..."

// QR size too small
Drop.create({ qrSize: 50, ... })
// Error: "QR size must be between 128 and 1024 pixels. Received: 50"

// Polling interval too fast
Drop.create({ pollingInterval: 100, ... })
// Error: "pollingInterval must be between 1000 and 60000 milliseconds. Received: 100"

// Invalid corner radius
Drop.create({ qrOptions: { cornerRadius: 2.5 }, ... })
// Error: "cornerRadius must be between 0 and 1. Received: 2.5"

// Invalid color format
Drop.create({ qrOptions: { moduleColor: 'invalid' }, ... })
// Error: "moduleColor must be a valid color format (hex, rgb, rgba, hsl, or hsla). Received: invalid"

// Link text too long
Drop.create({ linkText: 'A'.repeat(101), ... })
// Error: "linkText must be 100 characters or less. Received length: 101"

// Invalid callback type
Drop.create({ onStatusChange: 'not a function', ... })
// Error: "onStatusChange must be a function if provided. Received: string"
```

## Implementation Details

### Files Added

- **sdk/drop-js/src/validator.ts** - Core validation logic with `validateDropConfig()` function
- **sdk/drop-js/src/validator.test.ts** - Comprehensive test suite with 32 test cases

### Files Modified

- **sdk/drop-js/src/index.ts** - Added validation call at start of `Drop.create()`
- **sdk/drop-js/src/types.ts** - Added `VALIDATION_ERROR` to `DropErrorCode` enum
- **sdk/drop-js/src/index.test.ts** - Added 11 integration tests for validation scenarios

### Exported API

```typescript
export { ValidationError } from './validator';
```

The `ValidationError` class extends `Error` and can be caught separately from other errors.

## Testing

The implementation includes 105 passing tests:
- 32 unit tests for validator functions (boundary tests, format tests, type tests, edge cases)
- 11 integration tests for validation in `Drop.create()`
- 62 existing tests for other SDK functionality

Run tests:
```bash
cd sdk/drop-js
npm test
```

## Backward Compatibility

This is a **breaking change** for any existing code that uses invalid configurations. However:
- The SDK is new (v0.1.0), so minimal impact expected
- Clear error messages help developers fix issues quickly
- Most valid configurations will continue to work unchanged

## Benefits

✅ **Server Protection**: Prevents DOS attacks via excessive polling (min 1000ms interval)
✅ **Browser Protection**: Prevents memory issues from huge QR codes (max 1024px)
✅ **Developer Experience**: Clear error messages during development catch bugs early
✅ **Runtime Safety**: Validates types and bounds that TypeScript can't check
✅ **Security**: Ensures clientSecret follows expected format to prevent auth errors
✅ **Consistency**: Unified error handling across the SDK
