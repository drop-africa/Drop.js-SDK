export const PaymentStatuses = {
  INITIATED: "initiated",
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type DropPaymentStatus =
  (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export const ErrorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export type DropErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface DropError {
  code: DropErrorCode;
  message: string;
  retryable: boolean;
}

export interface QROptions {
  moduleColor?: string;
  backgroundColor?: string;
  cornerRadius?: number;
  showCopyableLink?: boolean;
  linkText?: string;
}

export interface DropConfig {
  clientSecret: string;
  instanceUrl: string;
  containerId: string;
  apiBaseUrl?: string;
  qrSize?: number;
  qrOptions?: QROptions;
  pollingInterval?: number;
  showCopyableLink?: boolean;
  linkText?: string;
  onStatusChange?: (status: DropPaymentStatus) => void;
  onError?: (error: DropError) => void;
  onPoll?: () => void;
}

export interface DropInstance {
  destroy(): void;
  getStatus(): DropPaymentStatus;
}

export interface StatusResponse {
  paymentIntentId: string;
  status: string;
  currency: string;
  amount: number;
  expiresAt: string;
}
