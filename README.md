# Drop.js SDK

Embed payment QR codes in your web app and poll for payment status changes in real-time.

[![npm version](https://img.shields.io/npm/v/@drop-africa/drop-js.svg)](https://www.npmjs.com/package/@drop-africa/drop-js)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@drop-africa/drop-js)](https://bundlephobia.com/package/@drop-africa/drop-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **QR Code Rendering**: Scannable QR codes with customizable styling
- **Polling**: Automatic status updates with configurable intervals
- **Copyable Links**: Optional fallback for users who can't scan QR codes
- **TypeScript Support**: Full type definitions included
- **Validation**: Input validation with descriptive error messages
- **Browser Compatible**: Works in modern browsers (Chrome, Firefox, Safari, Edge)
- **Lightweight**: ~22KB gzipped (ESM), ~19KB gzipped (UMD)

## Installation

### NPM

```bash
npm install @drop-africa/drop-js
```

### CDN (Browser)

```html
<script src="https://cdn.drop.africa/sdk/drop.js"></script>
```

## Quick Start

### CDN Usage (6 lines)

```html
<div id="payment-qr"></div>

<script src="https://cdn.drop.africa/sdk/drop.js"></script>
<script>
  Drop.create({
    clientSecret: 'pi_secret_your_payment_intent_secret',
    instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
    containerId: 'payment-qr'
  });
</script>
```

### NPM/React Usage

```typescript
import { Drop, PaymentStatuses } from '@drop-africa/drop-js';

function PaymentPage() {
  useEffect(() => {
    const instance = await Drop.create({
      clientSecret: 'pi_secret_your_payment_intent_secret',
      instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
      containerId: 'payment-qr',
      onStatusChange: (status) => {
        if (status === PaymentStatuses.SUCCEEDED) {
          console.log('Payment successful!');
        }
      }
    });

    return () => instance.destroy();
  }, []);

  return <div id="payment-qr"></div>;
}
```

## API Reference

### `Drop.create(config: DropConfig): Promise<DropInstance>`

Creates a Drop instance that renders a QR code and polls for payment status.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `clientSecret` | `string` | ✅ | - | Payment intent client secret (starts with `pi_secret_`) |
| `instanceUrl` | `string` | ✅ | - | Full URL to the payment intent resource |
| `containerId` | `string` | ✅ | - | DOM element ID where QR code will be rendered |
| `apiBaseUrl` | `string` | ❌ | `https://drop.africa` | Base URL for API requests |
| `qrSize` | `number` | ❌ | `256` | QR code size in pixels (128-1024) |
| `pollingInterval` | `number` | ❌ | `3000` | Polling interval in milliseconds (1000-60000) |
| `showCopyableLink` | `boolean` | ❌ | `true` | Show copyable payment link below QR code |
| `linkText` | `string` | ❌ | `"Or paste this link:"` | Text above copyable link (max 100 chars) |
| `qrOptions.moduleColor` | `string` | ❌ | `hsl(160, 65%, 25%)` | QR code foreground color |
| `qrOptions.backgroundColor` | `string` | ❌ | `hsl(0, 0%, 98%)` | QR code background color |
| `qrOptions.cornerRadius` | `number` | ❌ | `0` | Corner radius for QR modules (0-1) |
| `onStatusChange` | `(status) => void` | ❌ | - | Callback when payment status changes |
| `onError` | `(error) => void` | ❌ | - | Callback when errors occur |
| `onPoll` | `() => void` | ❌ | - | Callback on each polling attempt |

#### Returns

`Promise<DropInstance>` - Instance with `destroy()` and `getStatus()` methods

#### Example

```javascript
const instance = await Drop.create({
  clientSecret: 'pi_secret_1234567890abcdef',
  instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
  containerId: 'payment-qr',
  qrSize: 512,
  pollingInterval: 5000,
  qrOptions: {
    cornerRadius: 0.5,
    moduleColor: '#00796B',
    backgroundColor: '#F5F5F5'
  },
  linkText: 'Scan or paste this link',
  onStatusChange: (status) => {
    console.log('Payment status:', status);
  },
  onError: (error) => {
    console.error('Error:', error.message);
  }
});
```

### `DropInstance`

#### Methods

##### `destroy(): void`

Stops polling and removes the QR code from the DOM.

```javascript
instance.destroy();
```

##### `getStatus(): DropPaymentStatus`

Returns the current payment status.

```javascript
const status = instance.getStatus();
// Returns: "initiated" | "pending" | "succeeded" | "failed" | "cancelled" | "expired"
```

## Configuration

### Payment Statuses

| Status | Description |
|--------|-------------|
| `initiated` | Payment intent created, waiting for customer action |
| `pending` | Customer scanned QR code, payment processing |
| `succeeded` | Payment completed successfully |
| `failed` | Payment failed (insufficient funds, network error, etc.) |
| `cancelled` | Payment cancelled by customer or merchant |
| `expired` | Payment intent expired (typically after 24 hours) |

### Color Formats

Supported color formats for `moduleColor` and `backgroundColor`:

- **Hex**: `#000`, `#000000`, `#AbC123`
- **RGB**: `rgb(0, 0, 0)`, `rgb(255, 128, 64)`
- **RGBA**: `rgba(0, 0, 0, 1)`, `rgba(255, 128, 64, 0.5)`
- **HSL**: `hsl(0, 0%, 0%)`, `hsl(240, 100%, 50%)`
- **HSLA**: `hsla(0, 0%, 0%, 1)`, `hsla(240, 100%, 50%, 0.5)`

### Validation Constraints

The SDK validates all configuration parameters and throws `ValidationError` for invalid inputs:

| Parameter | Constraint | Rationale |
|-----------|-----------|-----------|
| `clientSecret` | Min 10 chars, starts with `pi_secret_` | Catches auth errors early |
| `qrSize` | 128-1024 pixels | Below 128 = hard to scan; above 1024 = memory issues |
| `pollingInterval` | 1000-60000 ms | Prevents server DOS; maintains real-time UX |
| `cornerRadius` | 0-1 | QR libraries use 0-1 range |
| `moduleColor` | Valid color format | Must be hex, rgb, rgba, hsl, or hsla |
| `backgroundColor` | Valid color format | Must be hex, rgb, rgba, hsl, or hsla |
| `linkText` | Max 100 characters | Prevents UI layout breaking |

## Error Handling

### Validation Errors

```javascript
import { Drop, ValidationError } from '@drop-africa/drop-js';

try {
  await Drop.create({
    clientSecret: 'invalid',
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

### Runtime Errors

```javascript
Drop.create({
  clientSecret: 'pi_secret_1234567890',
  instanceUrl: '...',
  containerId: 'payment-qr',
  onError: (error) => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.error('Network issue:', error.message);
        if (error.retryable) {
          // Polling will automatically retry
        }
        break;
      case 'AUTH_ERROR':
        console.error('Invalid client secret');
        break;
      case 'RATE_LIMITED':
        console.error('Too many requests');
        break;
      case 'NOT_FOUND':
        console.error('Payment intent not found');
        break;
    }
  }
});
```

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| `NETWORK_ERROR` | Network connectivity issue | ✅ |
| `AUTH_ERROR` | Invalid client secret | ❌ |
| `RATE_LIMITED` | Too many polling requests | ✅ |
| `NOT_FOUND` | Payment intent not found | ❌ |
| `VALIDATION_ERROR` | Invalid configuration | ❌ |
| `UNKNOWN` | Unexpected error | ❌ |

### Using Constants

For type-safe handling, use the exported constants instead of string literals:

```typescript
import { Drop, ErrorCodes, PaymentStatuses } from '@drop-africa/drop-js';

Drop.create({
  clientSecret: 'pi_secret_1234567890',
  instanceUrl: '...',
  containerId: 'payment-qr',
  onStatusChange: (status) => {
    if (status === PaymentStatuses.SUCCEEDED) {
      console.log('Payment successful!');
    }
  },
  onError: (error) => {
    if (error.code === ErrorCodes.NETWORK_ERROR) {
      console.error('Network issue:', error.message);
    }
  }
});
```

## Browser Support

Drop.js works in all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Not supported**: Internet Explorer (use a polyfill for Promise and fetch if needed)

## TypeScript

Full TypeScript definitions are included. Import types directly:

```typescript
import { Drop, DropConfig, DropInstance, DropPaymentStatus, DropError, ErrorCodes, PaymentStatuses } from '@drop-africa/drop-js';

const config: DropConfig = {
  clientSecret: 'pi_secret_1234567890',
  instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
  containerId: 'payment-qr'
};

const instance: DropInstance = await Drop.create(config);
const status: DropPaymentStatus = instance.getStatus();
```

## Examples

### React Component

```typescript
import { Drop, DropPaymentStatus, PaymentStatuses } from '@drop-africa/drop-js';
import { useEffect, useState } from 'react';

export function Payment({ clientSecret, instanceUrl }) {
  const [status, setStatus] = useState<DropPaymentStatus>(PaymentStatuses.INITIATED);

  useEffect(() => {
    const instance = await Drop.create({
      clientSecret,
      instanceUrl,
      containerId: 'payment-qr',
      onStatusChange: setStatus
    });

    return () => instance.destroy();
  }, [clientSecret, instanceUrl]);

  return (
    <div>
      {status === PaymentStatuses.SUCCEEDED ? (
        <p>Payment successful!</p>
      ) : (
        <div id="payment-qr"></div>
      )}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div>
    <div v-if="status === PaymentStatuses.SUCCEEDED">Payment successful!</div>
    <div v-else id="payment-qr"></div>
  </div>
</template>

<script setup>
import { Drop, PaymentStatuses } from '@drop-africa/drop-js';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps(['clientSecret', 'instanceUrl']);
const status = ref(PaymentStatuses.INITIATED);
let instance;

onMounted(async () => {
  instance = await Drop.create({
    clientSecret: props.clientSecret,
    instanceUrl: props.instanceUrl,
    containerId: 'payment-qr',
    onStatusChange: (newStatus) => {
      status.value = newStatus;
    }
  });
});

onUnmounted(() => {
  instance?.destroy();
});
</script>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Drop.js Payment</title>
</head>
<body>
  <div id="payment-qr"></div>
  <div id="status"></div>

  <script src="https://cdn.drop.africa/sdk/drop.js"></script>
  <script>
    const { PaymentStatuses } = Drop;

    Drop.create({
      clientSecret: 'pi_secret_1234567890abcdef',
      instanceUrl: 'https://drop.africa/api/v1/payment-accounts/acc_123/payment-intents/pi_456',
      containerId: 'payment-qr',
      onStatusChange: (status) => {
        document.getElementById('status').textContent = `Status: ${status}`;
        if (status === PaymentStatuses.SUCCEEDED) {
          alert('Payment successful!');
        }
      },
      onError: (error) => {
        console.error('Payment error:', error);
      }
    });
  </script>
</body>
</html>
```

## Links

- [Documentation](https://github.com/drop-africa/Drop.js-SDK#readme)
- [GitHub Repository](https://github.com/drop-africa/Drop.js-SDK)
- [npm Package](https://www.npmjs.com/package/@drop-africa/drop-js)
- [Issues](https://github.com/drop-africa/Drop.js-SDK/issues)

## License

MIT
