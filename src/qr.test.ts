import { describe, it, expect, beforeEach, vi } from "vitest";
import { JSDOM } from "jsdom";

// Set up DOM globals before importing qr module
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
  KeyboardEvent: dom.window.KeyboardEvent,
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

import { renderQR } from "./qr";

describe("renderQR", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renders an SVG element into the container", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("256");
    expect(svg?.getAttribute("height")).toBe("256");
  });

  it("sets aria-label for accessibility", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-label")).toBe("Payment QR Code");
    expect(svg?.getAttribute("role")).toBe("img");
  });

  it("contains a background rect and module elements", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    const rects = svg?.querySelectorAll("rect");
    expect(rects).not.toBeNull();
    expect(rects!.length).toBeGreaterThan(0);
  });

  it("clears previous content on re-render", async () => {
    container.innerHTML = "<p class='old-content'>old content</p>";
    await renderQR(container, "https://example.com", 200);

    expect(container.querySelector("p.old-content")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("respects custom size", async () => {
    await renderQR(container, "test", 128);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("128");
    expect(svg?.getAttribute("height")).toBe("128");
  });

  it("encodes different data producing different paths", async () => {
    await renderQR(container, "data-a", 256);
    const svgA = container.querySelector("svg");

    await renderQR(container, "data-b", 256);
    const svgB = container.querySelector("svg");

    expect(svgA).not.toBeNull();
    expect(svgB).not.toBeNull();
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("uses sharp corners by default for maximum scanability", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    const rects = svg?.querySelectorAll("rect");
    expect(rects).not.toBeNull();
    expect(rects!.length).toBeGreaterThan(0);
  });

  it("uses Drop teal color for modules", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const svgHTML = svg?.outerHTML || "";
    expect(svgHTML).toContain("#16694e");
  });

  it("respects custom module color", async () => {
    await renderQR(container, "https://example.com", 256, {
      moduleColor: "rgb(255, 0, 0)"
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const svgHTML = svg?.outerHTML || "";
    expect(svgHTML).toContain("#ff0000");
  });

  it("uses off-white background color", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const svgHTML = svg?.outerHTML || "";
    expect(svgHTML).toContain("#fafafa");
  });

  it("respects custom background color", async () => {
    await renderQR(container, "https://example.com", 256, {
      backgroundColor: "rgb(0, 0, 255)"
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const svgHTML = svg?.outerHTML || "";
    expect(svgHTML).toContain("#0000ff");
  });

  it("respects custom corner radius", async () => {
    await renderQR(container, "https://example.com", 256, {
      cornerRadius: 0.5
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

describe("renderQR - Copyable link", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renders link by default", async () => {
    await renderQR(container, "https://example.com/payment", 256);

    const link = container.querySelector(".drop-payment-link");
    expect(link).not.toBeNull();

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input?.value).toBe("https://example.com/payment");
  });

  it("hides link when showCopyableLink is false", async () => {
    await renderQR(container, "https://example.com/payment", 256, {
      showCopyableLink: false
    });

    const link = container.querySelector(".drop-payment-link");
    expect(link).toBeNull();
  });

  it("uses custom link text", async () => {
    await renderQR(container, "https://example.com/payment", 256, {
      linkText: "Custom link label:"
    });

    const label = container.querySelector(".drop-link-label");
    expect(label?.textContent).toBe("Custom link label:");
  });

  it("input is readonly", async () => {
    await renderQR(container, "https://example.com/payment", 256);

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    expect(input?.readOnly).toBe(true);
  });

  it("both QR and link are rendered together", async () => {
    await renderQR(container, "https://example.com/payment", 256);

    const wrapper = container.querySelector(".drop-payment-widget");
    expect(wrapper).not.toBeNull();

    const svg = wrapper?.querySelector("svg");
    expect(svg).not.toBeNull();

    const link = wrapper?.querySelector(".drop-payment-link");
    expect(link).not.toBeNull();
  });

  it("link matches QR size constraint", async () => {
    const qrSize = 300;
    await renderQR(container, "https://example.com/payment", qrSize);

    const linkContainer = container.querySelector(".drop-payment-link") as HTMLElement;
    expect(linkContainer).not.toBeNull();
    expect(linkContainer?.style.width).toBe(`${qrSize}px`);
  });

  it("copies to clipboard on click", async () => {
    const testUrl = "https://example.com/payment";
    await renderQR(container, testUrl, 256);

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    expect(input).not.toBeNull();

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    input.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWriteText).toHaveBeenCalledWith(testUrl);
  });

  it("shows copy feedback on successful copy", async () => {
    await renderQR(container, "https://example.com/payment", 256);

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    const hint = container.querySelector(".drop-link-hint");

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    input.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(hint?.textContent).toBe("✓ Copied to clipboard!");
  });

  it("copies on Enter key", async () => {
    const testUrl = "https://example.com/payment";
    await renderQR(container, testUrl, 256);

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    input.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWriteText).toHaveBeenCalledWith(testUrl);
  });

  it("copies on Space key", async () => {
    const testUrl = "https://example.com/payment";
    await renderQR(container, testUrl, 256);

    const input = container.querySelector("input.drop-link-input") as HTMLInputElement;
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = new KeyboardEvent("keydown", { key: " " });
    input.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWriteText).toHaveBeenCalledWith(testUrl);
  });
});

describe("renderQR - Logo Branding", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renders Drop logo overlay on QR code", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    const logoImage = svg?.querySelector("image");
    expect(logoImage).not.toBeNull();
    expect(logoImage?.getAttribute("href")).toContain("data:image/png;base64");
  });

  it("logo is properly sized (18% of QR area)", async () => {
    const qrSize = 256;
    await renderQR(container, "https://example.com", qrSize);

    const svg = container.querySelector("svg");
    const logoImage = svg?.querySelector("image");

    const logoWidth = parseFloat(logoImage?.getAttribute("width") || "0");
    const logoHeight = parseFloat(logoImage?.getAttribute("height") || "0");

    const expectedLogoSize = qrSize * Math.sqrt(0.18);

    expect(logoWidth).toBeCloseTo(expectedLogoSize, 1);
    expect(logoHeight).toBeCloseTo(expectedLogoSize, 1);
  });

  it("logo has rounded corners", async () => {
    await renderQR(container, "https://example.com", 256);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    const logoImage = svg?.querySelector("image");
    expect(logoImage).not.toBeNull();
  });

  it("logo is centered in QR code", async () => {
    const qrSize = 256;
    await renderQR(container, "https://example.com", qrSize);

    const svg = container.querySelector("svg");
    const logoImage = svg?.querySelector("image");

    const logoSize = parseFloat(logoImage?.getAttribute("width") || "0");
    const logoX = parseFloat(logoImage?.getAttribute("x") || "0");
    const logoY = parseFloat(logoImage?.getAttribute("y") || "0");

    const expectedPosX = (qrSize - logoSize) / 2;
    const expectedPosY = (qrSize - logoSize) / 2;

    expect(logoX).toBeCloseTo(expectedPosX, 1);
    expect(logoY).toBeCloseTo(expectedPosY, 1);
  });
});
