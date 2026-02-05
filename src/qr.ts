import type { QROptions } from './types';
import QRCodeStyling from 'qr-code-styling';
import { DROP_LOGO_PNG } from './assets/logo-icon';

function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([key, value]) => {
    (element.style as any)[key] = value;
  });
}

function convertColorToHex(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }

  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }

  if (color.startsWith('hsl')) {
    const match = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (match) {
      const h = parseInt(match[1]) / 360;
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;

      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  return color;
}


function createLinkElement(url: string, size: number, labelText: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "drop-payment-link";
  applyStyles(container, {
    marginTop: "16px",
    width: `${size}px`,
  });

  const label = document.createElement("label");
  label.className = "drop-link-label";
  label.textContent = labelText;
  applyStyles(label, {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "hsl(160, 65%, 25%)",
    marginBottom: "8px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "drop-link-input-wrapper";
  applyStyles(inputWrapper, {
    position: "relative",
  });

  const input = document.createElement("input");
  input.type = "text";
  input.readOnly = true;
  input.value = url;
  input.className = "drop-link-input";
  input.setAttribute("aria-label", "Payment link");

  const hint = document.createElement("p");
  hint.className = "drop-link-hint";
  hint.textContent = "Tap to copy";
  applyStyles(hint, {
    fontSize: "12px",
    color: "hsl(160, 30%, 40%)",
    marginTop: "6px",
    marginBottom: "0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  const copyToClipboard = async () => {
    input.select();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        showCopyFeedback();
      } else {
        const success = document.execCommand("copy");
        if (success) {
          showCopyFeedback();
        }
      }
    } catch (err) {
      document.execCommand("copy");
      showCopyFeedback();
    }
  };

  const showCopyFeedback = () => {
    const originalText = hint.textContent;
    hint.textContent = "✓ Copied to clipboard!";
    applyStyles(hint, {
      color: "hsl(160, 65%, 35%)",
      fontWeight: "500",
    });

    setTimeout(() => {
      hint.textContent = originalText;
      applyStyles(hint, {
        color: "hsl(160, 30%, 40%)",
        fontWeight: "normal",
      });
    }, 2000);
  };

  input.addEventListener("click", copyToClipboard);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyToClipboard();
    }
  });

  applyStyles(input, {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontFamily: "monospace",
    border: "2px solid hsl(160, 65%, 25%)",
    borderRadius: "8px",
    backgroundColor: "hsl(0, 0%, 98%)",
    color: "hsl(160, 65%, 25%)",
    boxSizing: "border-box",
    cursor: "pointer",
    outline: "none",
  });

  input.addEventListener("focus", () => {
    applyStyles(input, {
      borderColor: "hsl(160, 65%, 35%)",
      backgroundColor: "hsl(160, 80%, 98%)",
    });
  });

  input.addEventListener("blur", () => {
    applyStyles(input, {
      borderColor: "hsl(160, 65%, 25%)",
      backgroundColor: "hsl(0, 0%, 98%)",
    });
  });

  inputWrapper.appendChild(input);
  container.appendChild(label);
  container.appendChild(inputWrapper);
  container.appendChild(hint);

  return container;
}

export async function renderQR(
  container: HTMLElement,
  data: string,
  size: number,
  options: QROptions = {}
): Promise<void> {
  const {
    moduleColor = "hsl(160, 65%, 25%)",
    backgroundColor = "hsl(0, 0%, 98%)",
    cornerRadius = 0,
    showCopyableLink = true,
    linkText = "Or paste this link:",
  } = options;

  const hexModuleColor = convertColorToHex(moduleColor);
  const hexBackgroundColor = convertColorToHex(backgroundColor);

  const logoPercentage = Math.sqrt(0.18);
  const imageMargin = Math.round(size * 0.03);

  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    type: "svg",
    data: data,
    image: DROP_LOGO_PNG,
    qrOptions: {
      errorCorrectionLevel: 'H'
    },
    dotsOptions: {
      color: hexModuleColor,
      type: cornerRadius > 0 ? "rounded" : "square"
    },
    backgroundOptions: {
      color: hexBackgroundColor,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: logoPercentage,
      margin: imageMargin
    }
  });

  const wrapper = document.createElement("div");
  wrapper.className = "drop-payment-widget";

  qrCode.append(wrapper);

  const svg = wrapper.querySelector("svg");
  if (svg) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Payment QR Code');
  }

  if (showCopyableLink) {
    const linkElement = createLinkElement(data, size, linkText);
    wrapper.appendChild(linkElement);
  }

  container.innerHTML = "";
  container.appendChild(wrapper);
}
