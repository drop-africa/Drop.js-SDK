import type { DropPaymentStatus } from "./types";

const STATUS_MAP: Record<string, DropPaymentStatus> = {
  PaymentInitiated: "initiated",
  PaymentPending: "pending",
  PaymentSucceeded: "succeeded",
  PaymentFailed: "failed",
  PaymentCancelled: "cancelled",
  PaymentExpired: "expired",
};

const TERMINAL_STATUSES: Set<DropPaymentStatus> = new Set([
  "succeeded",
  "failed",
  "cancelled",
  "expired",
]);

export function mapStatus(backendStatus: string): DropPaymentStatus | null {
  return STATUS_MAP[backendStatus] ?? null;
}

export function isTerminal(status: DropPaymentStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}
