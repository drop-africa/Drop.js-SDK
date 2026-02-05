import type { DropConfig, DropInstance, DropPaymentStatus } from "./types";
import { Poller } from "./poller";
import { renderQR } from "./qr";
import { validateDropConfig } from "./validator";

const DEFAULT_QR_SIZE = 256;

function parseInstanceUrl(instanceUrl: string): {
  paymentAccountId: string;
  paymentIntentId: string;
  apiBaseUrl: string;
  queryString: string;
} {
  const urlWithoutQuery = instanceUrl.split('?')[0].split('#')[0];
  const queryString = instanceUrl.includes('?')
    ? instanceUrl.substring(instanceUrl.indexOf('?'))
    : '';

const pattern = 
  /\/payment-accounts\/([^/]+)\/payment-intents\/([^/]+)/;
  const match = urlWithoutQuery.match(pattern);

  if (!match) {
    throw new Error(
      "Invalid instanceUrl format. Expected: .../payment-accounts/{id}/payment-intents/{id}",
    );
  }

  const paymentAccountId = match[1];
  const paymentIntentId = match[2];
  const apiBaseUrl = urlWithoutQuery.substring(
    0,
    urlWithoutQuery.indexOf("/payment-accounts/"),
  );

  return { paymentAccountId, paymentIntentId, apiBaseUrl, queryString };
}

export const Drop = {
  async create(config: DropConfig): Promise<DropInstance> {
    validateDropConfig(config);

    const {
      clientSecret,
      instanceUrl,
      containerId,
      qrSize = DEFAULT_QR_SIZE,
      pollingInterval,
      onStatusChange,
      onError,
      onPoll,
    } = config;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Element with id "${containerId}" not found.`);
    }

    const { paymentAccountId, paymentIntentId, apiBaseUrl: parsedApiBaseUrl, queryString } =
      parseInstanceUrl(instanceUrl);
    const apiBaseUrl = config.apiBaseUrl || parsedApiBaseUrl;

    const { qrOptions, showCopyableLink, linkText } = config;
    await renderQR(container, instanceUrl, qrSize, {
      ...qrOptions,
      showCopyableLink,
      linkText,
    });

    const poller = new Poller({
      apiBaseUrl,
      paymentAccountId,
      paymentIntentId,
      clientSecret,
      queryString,
      pollingInterval,
      onStatusChange: (status: DropPaymentStatus) => {
        onStatusChange?.(status);
      },
      onError: (error) => {
        onError?.(error);
      },
      onPoll: () => {
        onPoll?.();
      },
    });

    poller.start();

    return {
      destroy() {
        poller.stop();
        container.innerHTML = "";
      },
      getStatus(): DropPaymentStatus {
        return poller.getStatus();
      },
    };
  },
};

export { renderQR } from "./qr";
export { ValidationError } from "./validator";
export { ErrorCodes, PaymentStatuses } from "./types";

export type {
  DropConfig,
  DropInstance,
  DropPaymentStatus,
  DropError,
  DropErrorCode,
  QROptions,
} from "./types";
