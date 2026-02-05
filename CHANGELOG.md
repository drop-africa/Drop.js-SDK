# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-31

### Added

- **QR Code Rendering**: Embed high-quality, scannable payment QR codes with customizable styling
  - Configurable size (128-1024 pixels)
  - Custom colors (hex, rgb, rgba, hsl, hsla formats)
  - Adjustable corner radius (0-1 range)
  - Drop Africa branding with centered logo
- **Real-time Polling**: Automatic payment status updates
  - Configurable polling interval (1000-60000ms)
  - Smart polling lifecycle management
  - Automatic cleanup on completion or error
- **Copyable Payment Links**: Optional fallback for users who cannot scan QR codes
  - Toggle visibility with `showCopyableLink`
  - Customizable link text
  - One-click copy functionality
- **Status Management**: Track payment lifecycle through 6 states
  - `initiated`, `pending`, `succeeded`, `failed`, `cancelled`, `expired`
  - `onStatusChange` callback for real-time updates
  - `getStatus()` method for current state
- **Comprehensive Validation**: Input validation with clear error messages
  - Client secret format validation (min 10 chars, `pi_secret_` prefix)
  - QR size bounds checking (128-1024px)
  - Polling interval limits (1000-60000ms)
  - Color format validation (hex, rgb, rgba, hsl, hsla)
  - Corner radius range checking (0-1)
  - Link text length validation (max 100 chars)
  - Callback type validation
- **Error Handling**: Structured error reporting with retry logic
  - Error codes: `NETWORK_ERROR`, `AUTH_ERROR`, `RATE_LIMITED`, `NOT_FOUND`, `VALIDATION_ERROR`, `UNKNOWN`
  - Retryable error detection
  - `onError` callback for custom error handling
- **TypeScript Support**: Full type definitions for all APIs
  - `DropConfig`, `DropInstance`, `DropPaymentStatus`, `DropError`, `QROptions`
  - Exported `ValidationError` class
- **Browser Compatibility**: Works in all modern browsers
  - Chrome/Edge 90+, Firefox 88+, Safari 14+, Opera 76+
  - Lightweight bundles: ESM (21.73 KB gzipped), UMD (19.33 KB gzipped)
- **Multiple Distribution Formats**:
  - ESM for modern bundlers (Vite, Webpack, Rollup)
  - UMD for CDN usage and legacy browsers
  - TypeScript declaration files
- **Lifecycle Management**: Clean resource cleanup
  - `destroy()` method stops polling and removes DOM elements
  - Automatic cleanup on terminal statuses
- **Developer Experience**:
  - `onPoll` callback for debugging and analytics
  - Clear validation error messages
  - Comprehensive test coverage (105 tests)

### Security

- **Client Secret Validation**: Ensures secrets start with `pi_secret_` to catch authentication errors early
- **Rate Limiting Protection**: Enforces minimum 1000ms polling interval to prevent server DOS
- **Input Sanitization**: Validates all user inputs to prevent injection attacks
- **Secure Defaults**: Conservative default values for all configuration parameters

### Changed

N/A (initial release)

### Deprecated

N/A (initial release)

### Removed

N/A (initial release)

### Fixed

N/A (initial release)

## Links

- [GitHub Releases](https://github.com/Fabaladibbasey/drop/releases)
- [npm Package](https://www.npmjs.com/package/@drop-africa/drop-js)

[0.1.0]: https://github.com/Fabaladibbasey/drop/releases/tag/sdk-v0.1.0
