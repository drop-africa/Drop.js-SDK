import type { DropConfig } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateDropConfig(config: DropConfig): void {
  validateClientSecret(config.clientSecret);
  if (config.qrSize !== undefined) validateQRSize(config.qrSize);
  if (config.pollingInterval !== undefined) validatePollingInterval(config.pollingInterval);
  if (config.qrOptions) validateQROptions(config.qrOptions);
  if (config.linkText !== undefined) validateLinkText(config.linkText);
  validateCallbacks(config);
}

function validateClientSecret(clientSecret: string): void {
  if (!clientSecret || clientSecret.trim() === '') {
    throw new ValidationError('clientSecret is required and cannot be empty');
  }

  if (clientSecret.length < 10) {
    throw new ValidationError(
      `clientSecret must be at least 10 characters long. Received length: ${clientSecret.length}`
    );
  }

  if (!clientSecret.startsWith('pi_secret_')) {
    throw new ValidationError(
      "clientSecret must start with 'pi_secret_'. Received: " + clientSecret.substring(0, 10) + '...'
    );
  }
}

function validateQRSize(qrSize: number): void {
  if (typeof qrSize !== 'number' || isNaN(qrSize) || !isFinite(qrSize)) {
    throw new ValidationError(`qrSize must be a valid number. Received: ${qrSize}`);
  }

  if (qrSize < 128 || qrSize > 1024) {
    throw new ValidationError(
      `QR size must be between 128 and 1024 pixels. Received: ${qrSize}`
    );
  }
}

function validatePollingInterval(pollingInterval: number): void {
  if (typeof pollingInterval !== 'number' || isNaN(pollingInterval) || !isFinite(pollingInterval)) {
    throw new ValidationError(`pollingInterval must be a valid number. Received: ${pollingInterval}`);
  }

  if (pollingInterval < 1000 || pollingInterval > 60000) {
    throw new ValidationError(
      `pollingInterval must be between 1000 and 60000 milliseconds. Received: ${pollingInterval}`
    );
  }
}

function validateQROptions(qrOptions: DropConfig['qrOptions']): void {
  if (!qrOptions) return;

  if (qrOptions.cornerRadius !== undefined) {
    validateCornerRadius(qrOptions.cornerRadius);
  }

  if (qrOptions.moduleColor !== undefined) {
    validateColor(qrOptions.moduleColor, 'moduleColor');
  }

  if (qrOptions.backgroundColor !== undefined) {
    validateColor(qrOptions.backgroundColor, 'backgroundColor');
  }
}

function validateCornerRadius(cornerRadius: number): void {
  if (typeof cornerRadius !== 'number' || isNaN(cornerRadius) || !isFinite(cornerRadius)) {
    throw new ValidationError(`cornerRadius must be a valid number. Received: ${cornerRadius}`);
  }

  if (cornerRadius < 0 || cornerRadius > 1) {
    throw new ValidationError(
      `cornerRadius must be between 0 and 1. Received: ${cornerRadius}`
    );
  }
}

function validateColor(color: string, paramName: string): void {
  if (typeof color !== 'string') {
    throw new ValidationError(`${paramName} must be a string. Received: ${typeof color}`);
  }

  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const rgbaPattern = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  const hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const hslaPattern = /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

  let isValidColor = hexPattern.test(color);

  if (!isValidColor) {
    const rgbMatch = color.match(rgbPattern);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      isValidColor = parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255;
    }
  }

  if (!isValidColor) {
    const rgbaMatch = color.match(rgbaPattern);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      isValidColor = parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255;
    }
  }

  if (!isValidColor) {
    const hslMatch = color.match(hslPattern);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      isValidColor = parseInt(h) <= 360 && parseInt(s) <= 100 && parseInt(l) <= 100;
    }
  }

  if (!isValidColor) {
    const hslaMatch = color.match(hslaPattern);
    if (hslaMatch) {
      const [, h, s, l] = hslaMatch;
      isValidColor = parseInt(h) <= 360 && parseInt(s) <= 100 && parseInt(l) <= 100;
    }
  }

  if (!isValidColor) {
    throw new ValidationError(
      `${paramName} must be a valid color format (hex, rgb, rgba, hsl, or hsla). Received: ${color}`
    );
  }
}

function validateLinkText(linkText: string): void {
  if (typeof linkText !== 'string') {
    throw new ValidationError(`linkText must be a string. Received: ${typeof linkText}`);
  }

  if (linkText.length > 100) {
    throw new ValidationError(
      `linkText must be 100 characters or less. Received length: ${linkText.length}`
    );
  }
}

function validateCallbacks(config: DropConfig): void {
  if (config.onStatusChange !== undefined && typeof config.onStatusChange !== 'function') {
    throw new ValidationError(
      `onStatusChange must be a function if provided. Received: ${typeof config.onStatusChange}`
    );
  }

  if (config.onError !== undefined && typeof config.onError !== 'function') {
    throw new ValidationError(
      `onError must be a function if provided. Received: ${typeof config.onError}`
    );
  }

  if (config.onPoll !== undefined && typeof config.onPoll !== 'function') {
    throw new ValidationError(
      `onPoll must be a function if provided. Received: ${typeof config.onPoll}`
    );
  }
}
