import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  writable: true,
  configurable: true,
});
Object.assign(globalThis, {
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  SVGElement: dom.window.SVGElement,
  DOMParser: dom.window.DOMParser,
});

// Mock qr-code-styling since it requires full browser canvas environment
vi.mock('qr-code-styling', () => {
  return {
    default: class MockQRCodeStyling {
      private options: any;

      constructor(options: any) {
        this.options = options;
      }

      append(container: HTMLElement) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(this.options.width));
        svg.setAttribute('height', String(this.options.height));
        svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', '0');
        bgRect.setAttribute('y', '0');
        bgRect.setAttribute('width', String(this.options.width));
        bgRect.setAttribute('height', String(this.options.height));
        bgRect.setAttribute('fill', this.options.backgroundOptions?.color || '#ffffff');
        svg.appendChild(bgRect);

        const dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        dotsGroup.setAttribute('fill', this.options.dotsOptions?.color || '#000000');

        for (let i = 0; i < 10; i++) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(i * 20));
          rect.setAttribute('y', String(i * 20));
          rect.setAttribute('width', '10');
          rect.setAttribute('height', '10');
          if (this.options.dotsOptions?.type === 'rounded') {
            rect.setAttribute('rx', '2');
          }
          dotsGroup.appendChild(rect);
        }
        svg.appendChild(dotsGroup);

        if (this.options.image) {
          const logoSize = this.options.width * this.options.imageOptions.imageSize;
          const logoX = (this.options.width - logoSize) / 2;
          const logoY = (this.options.height - logoSize) / 2;

          const logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
          logoImage.setAttribute('href', this.options.image);
          logoImage.setAttribute('x', String(logoX));
          logoImage.setAttribute('y', String(logoY));
          logoImage.setAttribute('width', String(logoSize));
          logoImage.setAttribute('height', String(logoSize));
          svg.appendChild(logoImage);
        }

        container.appendChild(svg);
      }
    }
  };
});

import { Drop } from "./index";

describe("Drop.create", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const container = document.createElement("div");
    container.id = "drop-qr";
    document.body.appendChild(container);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            paymentIntentId: "test-id",
            status: "PaymentInitiated",
            currency: "GMD",
            amount: 100,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    const el = document.getElementById("drop-qr");
    if (el) el.remove();
  });

  it("renders QR code and returns an instance", async () => {
    const instance = await Drop.create({
      clientSecret: "pi_secret_test",
      instanceUrl:
        "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
      containerId: "drop-qr",
    });

    const svg = document.querySelector("#drop-qr svg");
    expect(svg).not.toBeNull();
    expect(instance.getStatus()).toBe("initiated");

    instance.destroy();
  });

  it("throws when container not found", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "nonexistent",
      })
    ).rejects.toThrow('Element with id "nonexistent" not found.');
  });

  it("throws when instanceUrl format is invalid", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl: "https://drop.africa/invalid-url",
        containerId: "drop-qr",
      })
    ).rejects.toThrow(
      "Invalid instanceUrl format. Expected: .../payment-accounts/{id}/payment-intents/{id}",
    );
  });

  it("destroy clears the container and stops polling", async () => {
    const instance = await Drop.create({
      clientSecret: "pi_secret_test",
      instanceUrl:
        "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
      containerId: "drop-qr",
    });

    await vi.advanceTimersByTimeAsync(0);

    const container = document.getElementById("drop-qr");
    expect(container?.querySelector("svg")).not.toBeNull();
    expect(container?.querySelector(".drop-payment-link")).not.toBeNull();

    instance.destroy();

    expect(container?.innerHTML).toBe("");
    expect(container?.querySelector("svg")).toBeNull();
    expect(container?.querySelector(".drop-payment-link")).toBeNull();

    const fetchMock = vi.mocked(fetch);
    const callsBefore = fetchMock.mock.calls.length;
    await vi.advanceTimersByTimeAsync(10000);
    expect(fetchMock.mock.calls.length).toBe(callsBefore);
  });

  it("calls onStatusChange when status updates", async () => {
    const statuses: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            paymentIntentId: "test-id",
            status: "PaymentSucceeded",
            currency: "GMD",
            amount: 100,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
      }),
    );

    const instance = await Drop.create({
      clientSecret: "pi_secret_test",
      instanceUrl:
        "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
      containerId: "drop-qr",
      onStatusChange: (s) => statuses.push(s),
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(statuses).toContain("succeeded");
    expect(instance.getStatus()).toBe("succeeded");

    instance.destroy();
  });

  it("calls onError on fetch failure", async () => {
    const errors: { code: string }[] = [];

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));

    const instance = await Drop.create({
      clientSecret: "pi_secret_test",
      instanceUrl:
        "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
      containerId: "drop-qr",
      onError: (e) => errors.push(e),
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe("NETWORK_ERROR");

    instance.destroy();
  });

  it("throws ValidationError for empty clientSecret", async () => {
    await expect(
      Drop.create({
        clientSecret: "",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
      })
    ).rejects.toThrow(/clientSecret is required/);
  });

  it("throws ValidationError for clientSecret without correct prefix", async () => {
    await expect(
      Drop.create({
        clientSecret: "invalid_secret_1234567890",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
      })
    ).rejects.toThrow(/must start with 'pi_secret_'/);
  });

  it("throws ValidationError for clientSecret shorter than 10 characters", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
      })
    ).rejects.toThrow(/at least 10 characters/);
  });

  it("throws ValidationError for qrSize too small", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        qrSize: 50,
      })
    ).rejects.toThrow(/QR size must be between/);
  });

  it("throws ValidationError for qrSize too large", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        qrSize: 10000,
      })
    ).rejects.toThrow(/QR size must be between/);
  });

  it("throws ValidationError for pollingInterval too fast", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        pollingInterval: 100,
      })
    ).rejects.toThrow(/pollingInterval must be between/);
  });

  it("throws ValidationError for pollingInterval too slow", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        pollingInterval: 120000,
      })
    ).rejects.toThrow(/pollingInterval must be between/);
  });

  it("throws ValidationError for invalid cornerRadius", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        qrOptions: {
          cornerRadius: 2.5,
        },
      })
    ).rejects.toThrow(/cornerRadius must be between 0 and 1/);
  });

  it("throws ValidationError for invalid color format", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        qrOptions: {
          moduleColor: "invalid-color",
        },
      })
    ).rejects.toThrow(/must be a valid color format/);
  });

  it("throws ValidationError for linkText too long", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        linkText: "A".repeat(101),
      })
    ).rejects.toThrow(/linkText must be 100 characters or less/);
  });

  it("throws ValidationError for non-function callback", async () => {
    await expect(
      Drop.create({
        clientSecret: "pi_secret_test",
        instanceUrl:
          "https://drop.africa/api/v1/payment-accounts/019957dc-cec4-7344-8445-e72332175cf1/payment-intents/019c0be6-6231-7462-b720-e368119cc1b4",
        containerId: "drop-qr",
        onStatusChange: "not a function" as any,
      })
    ).rejects.toThrow(/onStatusChange must be a function/);
  });
});
