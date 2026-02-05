import type { DropError, DropErrorCode } from "./types";

export function createError(
  code: DropErrorCode,
  message: string,
  retryable: boolean,
): DropError {
  return { code, message, retryable };
}

export function fromHttpStatus(status: number, message?: string): DropError {
  switch (status) {
    case 401:
      return createError("AUTH_ERROR", message ?? "Invalid client secret.", false);
    case 404:
      return createError("NOT_FOUND", message ?? "Payment intent not found.", false);
    case 429:
      return createError("RATE_LIMITED", message ?? "Rate limited. Retrying.", true);
    default:
      return createError("UNKNOWN", message ?? `Unexpected status: ${status}`, true);
  }
}

export function networkError(message: string): DropError {
  return createError("NETWORK_ERROR", message, true);
}
