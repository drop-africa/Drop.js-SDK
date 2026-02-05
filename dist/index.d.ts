export declare const Drop: {
    create(config: DropConfig): Promise<DropInstance>;
};

export declare interface DropConfig {
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

export declare interface DropError {
    code: DropErrorCode;
    message: string;
    retryable: boolean;
}

export declare type DropErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export declare interface DropInstance {
    destroy(): void;
    getStatus(): DropPaymentStatus;
}

export declare type DropPaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export declare const ErrorCodes: {
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly AUTH_ERROR: "AUTH_ERROR";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNKNOWN: "UNKNOWN";
};

export declare const PaymentStatuses: {
    readonly INITIATED: "initiated";
    readonly PENDING: "pending";
    readonly SUCCEEDED: "succeeded";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
    readonly EXPIRED: "expired";
};

export declare interface QROptions {
    moduleColor?: string;
    backgroundColor?: string;
    cornerRadius?: number;
    showCopyableLink?: boolean;
    linkText?: string;
}

export declare function renderQR(container: HTMLElement, data: string, size: number, options?: QROptions): Promise<void>;

export declare class ValidationError extends Error {
    constructor(message: string);
}

export { }
