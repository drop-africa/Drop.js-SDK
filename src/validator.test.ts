import { describe, it, expect } from 'vitest';
import { validateDropConfig, ValidationError } from './validator';
import type { DropConfig } from './types';

const validConfig: DropConfig = {
  clientSecret: 'pi_secret_1234567890abcdef',
  instanceUrl: 'https://drop.com/pay/acc_123/pi_456',
  containerId: 'qr-container',
};

describe('validateDropConfig', () => {
  it('accepts valid minimal config', () => {
    expect(() => validateDropConfig(validConfig)).not.toThrow();
  });

  it('accepts valid config with all optional parameters', () => {
    const fullConfig: DropConfig = {
      ...validConfig,
      qrSize: 512,
      pollingInterval: 5000,
      qrOptions: {
        cornerRadius: 0.5,
        moduleColor: '#000000',
        backgroundColor: '#ffffff',
      },
      linkText: 'Custom link text',
      onStatusChange: () => {},
      onError: () => {},
      onPoll: () => {},
    };
    expect(() => validateDropConfig(fullConfig)).not.toThrow();
  });
});

describe('validateClientSecret', () => {
  it('accepts valid clientSecret', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: 'pi_secret_1234567890',
      })
    ).not.toThrow();
  });

  it('rejects empty clientSecret', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: '',
      })
    ).toThrow(ValidationError);
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: '',
      })
    ).toThrow(/clientSecret is required/);
  });

  it('rejects whitespace-only clientSecret', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: '   ',
      })
    ).toThrow(/clientSecret is required/);
  });

  it('rejects clientSecret shorter than 10 characters', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: 'pi_secret',
      })
    ).toThrow(/at least 10 characters/);
  });

  it('rejects clientSecret without correct prefix', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        clientSecret: 'invalid_secret_1234567890',
      })
    ).toThrow(/must start with 'pi_secret_'/);
  });
});

describe('validateQRSize', () => {
  it('accepts valid sizes', () => {
    expect(() => validateDropConfig({ ...validConfig, qrSize: 128 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, qrSize: 256 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, qrSize: 512 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, qrSize: 1024 })).not.toThrow();
  });

  it('rejects size below minimum', () => {
    expect(() => validateDropConfig({ ...validConfig, qrSize: 127 })).toThrow(
      /between 128 and 1024/
    );
    expect(() => validateDropConfig({ ...validConfig, qrSize: 0 })).toThrow(
      /between 128 and 1024/
    );
    expect(() => validateDropConfig({ ...validConfig, qrSize: -100 })).toThrow(
      /between 128 and 1024/
    );
  });

  it('rejects size above maximum', () => {
    expect(() => validateDropConfig({ ...validConfig, qrSize: 1025 })).toThrow(
      /between 128 and 1024/
    );
    expect(() => validateDropConfig({ ...validConfig, qrSize: 10000 })).toThrow(
      /between 128 and 1024/
    );
  });

  it('rejects invalid number values', () => {
    expect(() => validateDropConfig({ ...validConfig, qrSize: NaN })).toThrow(
      /must be a valid number/
    );
    expect(() => validateDropConfig({ ...validConfig, qrSize: Infinity })).toThrow(
      /must be a valid number/
    );
    expect(() => validateDropConfig({ ...validConfig, qrSize: -Infinity })).toThrow(
      /must be a valid number/
    );
  });
});

describe('validatePollingInterval', () => {
  it('accepts valid intervals', () => {
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 1000 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 3000 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 30000 })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 60000 })).not.toThrow();
  });

  it('rejects interval below minimum', () => {
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 999 })).toThrow(
      /between 1000 and 60000/
    );
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 100 })).toThrow(
      /between 1000 and 60000/
    );
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 1 })).toThrow(
      /between 1000 and 60000/
    );
  });

  it('rejects interval above maximum', () => {
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 60001 })).toThrow(
      /between 1000 and 60000/
    );
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: 120000 })).toThrow(
      /between 1000 and 60000/
    );
  });

  it('rejects invalid number values', () => {
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: NaN })).toThrow(
      /must be a valid number/
    );
    expect(() => validateDropConfig({ ...validConfig, pollingInterval: Infinity })).toThrow(
      /must be a valid number/
    );
  });
});

describe('validateCornerRadius', () => {
  it('accepts valid corner radius values', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: 0 } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: 0.5 } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: 1 } })
    ).not.toThrow();
  });

  it('rejects corner radius below minimum', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: -0.1 } })
    ).toThrow(/between 0 and 1/);
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: -1 } })
    ).toThrow(/between 0 and 1/);
  });

  it('rejects corner radius above maximum', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: 1.1 } })
    ).toThrow(/between 0 and 1/);
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: 2.5 } })
    ).toThrow(/between 0 and 1/);
  });

  it('rejects invalid number values', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: NaN } })
    ).toThrow(/must be a valid number/);
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { cornerRadius: Infinity } })
    ).toThrow(/must be a valid number/);
  });
});

describe('validateColor', () => {
  it('accepts valid hex colors', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: '#000' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: '#000000' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: '#AbC123' } })
    ).not.toThrow();
  });

  it('accepts valid rgb colors', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'rgb(0, 0, 0)' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'rgb(255, 128, 64)' } })
    ).not.toThrow();
  });

  it('accepts valid rgba colors', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'rgba(0, 0, 0, 1)' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'rgba(255, 128, 64, 0.5)' } })
    ).not.toThrow();
  });

  it('accepts valid hsl colors', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'hsl(0, 0%, 0%)' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'hsl(240, 100%, 50%)' } })
    ).not.toThrow();
  });

  it('accepts valid hsla colors', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'hsla(0, 0%, 0%, 1)' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'hsla(240, 100%, 50%, 0.5)' } })
    ).not.toThrow();
  });

  it('rejects invalid color formats', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'invalid' } })
    ).toThrow(/must be a valid color format/);
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: '#gggggg' } })
    ).toThrow(/must be a valid color format/);
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { moduleColor: 'rgb(256, 0, 0)' } })
    ).toThrow(/must be a valid color format/);
  });

  it('validates backgroundColor as well', () => {
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { backgroundColor: '#fff' } })
    ).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, qrOptions: { backgroundColor: 'invalid' } })
    ).toThrow(/backgroundColor must be a valid color format/);
  });
});

describe('validateLinkText', () => {
  it('accepts valid link text', () => {
    expect(() => validateDropConfig({ ...validConfig, linkText: '' })).not.toThrow();
    expect(() => validateDropConfig({ ...validConfig, linkText: 'Short text' })).not.toThrow();
    expect(() =>
      validateDropConfig({ ...validConfig, linkText: 'A'.repeat(100) })
    ).not.toThrow();
  });

  it('rejects link text longer than 100 characters', () => {
    expect(() => validateDropConfig({ ...validConfig, linkText: 'A'.repeat(101) })).toThrow(
      /100 characters or less/
    );
    expect(() => validateDropConfig({ ...validConfig, linkText: 'A'.repeat(150) })).toThrow(
      /Received length: 150/
    );
  });
});

describe('validateCallbacks', () => {
  it('accepts valid callback functions', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        onStatusChange: () => {},
        onError: () => {},
        onPoll: () => {},
      })
    ).not.toThrow();
  });

  it('rejects non-function onStatusChange', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        onStatusChange: 'not a function' as any,
      })
    ).toThrow(/onStatusChange must be a function/);
  });

  it('rejects non-function onError', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        onError: {} as any,
      })
    ).toThrow(/onError must be a function/);
  });

  it('rejects non-function onPoll', () => {
    expect(() =>
      validateDropConfig({
        ...validConfig,
        onPoll: 'not a function' as any,
      })
    ).toThrow(/onPoll must be a function/);
  });
});
