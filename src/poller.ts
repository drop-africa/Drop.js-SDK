import type { DropError, DropPaymentStatus, StatusResponse } from "./types";
import { mapStatus, isTerminal } from "./status-map";
import { fromHttpStatus, networkError } from "./errors";

const DEFAULT_INTERVAL = 3000;
const BACKOFF_MULTIPLIER = 1.5;
const MAX_INTERVAL = 30000;
const MAX_CONSECUTIVE_FAILURES = 5;
const EXPIRY_GRACE_MS = 30000;

export interface PollerConfig {
  apiBaseUrl: string;
  paymentAccountId: string;
  paymentIntentId: string;
  clientSecret: string;
  queryString?: string;
  pollingInterval?: number;
  onStatusChange: (status: DropPaymentStatus) => void;
  onError: (error: DropError) => void;
  onPoll?: () => void;
}

export class Poller {
  private interval = DEFAULT_INTERVAL;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private consecutiveFailures = 0;
  private currentStatus: DropPaymentStatus = "initiated";
  private expiresAt: Date | null = null;
  private readonly config: PollerConfig;

  constructor(config: PollerConfig) {
    this.config = config;
    if (config.pollingInterval) {
      this.interval = config.pollingInterval;
    }
  }

  start(): void {
    this.poll();
  }

  stop(): void {
    this.destroyed = true;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getStatus(): DropPaymentStatus {
    return this.currentStatus;
  }

  private async poll(): Promise<void> {
    if (this.destroyed) return;

    this.config.onPoll?.();

    if (this.isExpired()) {
      this.emitStatus("expired");
      return;
    }

    try {
      const response = await this.fetchStatus();

      if (response.ok) {
        this.consecutiveFailures = 0;
        this.interval = DEFAULT_INTERVAL;

        const data: StatusResponse = await response.json();
        this.expiresAt = new Date(data.expiresAt);

        const mapped = mapStatus(data.status);
        if (mapped && mapped !== this.currentStatus) {
          this.emitStatus(mapped);
          if (isTerminal(mapped)) return;
        }
      } else if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        if (retryAfter) {
          const seconds = parseInt(retryAfter, 10);
          if (!isNaN(seconds)) {
            this.interval = seconds * 1000;
          }
        } else {
          this.applyBackoff();
        }
        this.config.onError(fromHttpStatus(429));
      } else if (response.status === 401 || response.status === 404) {
        this.config.onError(fromHttpStatus(response.status));
        return;
      } else {
        this.consecutiveFailures++;
        this.applyBackoff();
        this.config.onError(fromHttpStatus(response.status));

        if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          this.config.onError(
            fromHttpStatus(response.status, "Max consecutive failures reached. Stopping."),
          );
          return;
        }
      }
    } catch {
      this.consecutiveFailures++;
      this.applyBackoff();
      this.config.onError(networkError("Network request failed."));

      if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        this.config.onError(
          networkError("Max consecutive failures reached. Stopping."),
        );
        return;
      }
    }

    this.scheduleNext();
  }

  private async fetchStatus(): Promise<Response> {
    const queryString = this.config.queryString || '';
    const url = `${this.config.apiBaseUrl}/payment-accounts/${this.config.paymentAccountId}/payment-intents/${this.config.paymentIntentId}/status${queryString}`;
    return fetch(url, {
      method: "GET",
      headers: {
        "client-secret": this.config.clientSecret,
      },
    });
  }

  private emitStatus(status: DropPaymentStatus): void {
    this.currentStatus = status;
    this.config.onStatusChange(status);
  }

  private applyBackoff(): void {
    this.interval = Math.min(this.interval * BACKOFF_MULTIPLIER, MAX_INTERVAL);
  }

  private isExpired(): boolean {
    if (!this.expiresAt) return false;
    return Date.now() > this.expiresAt.getTime() + EXPIRY_GRACE_MS;
  }

  private scheduleNext(): void {
    if (this.destroyed) return;
    this.timer = setTimeout(() => this.poll(), this.interval);
  }
}
