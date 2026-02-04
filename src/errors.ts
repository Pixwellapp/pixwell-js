/**
 * Base error class for Pixwell SDK errors
 */
export class PixwellError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = "PixwellError";
        Object.setPrototypeOf(this, PixwellError.prototype);
    }
}

/**
 * Authentication error (invalid or missing API key)
 */
export class AuthenticationError extends PixwellError {
    constructor(message = "Invalid or missing API key") {
        super(message, "AUTHENTICATION_ERROR", 401);
        this.name = "AuthenticationError";
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends PixwellError {
    constructor(
        message = "Rate limit exceeded",
        public readonly retryAfter?: number
    ) {
        super(message, "RATE_LIMIT_ERROR", 429);
        this.name = "RateLimitError";
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Validation error for invalid parameters
 */
export class ValidationError extends PixwellError {
    constructor(
        message: string,
        public readonly field?: string
    ) {
        super(message, "VALIDATION_ERROR", 400);
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Screenshot capture error
 */
export class CaptureError extends PixwellError {
    constructor(message: string) {
        super(message, "CAPTURE_ERROR", 500);
        this.name = "CaptureError";
        Object.setPrototypeOf(this, CaptureError.prototype);
    }
}

/**
 * Network or timeout error
 */
export class NetworkError extends PixwellError {
    constructor(message = "Network request failed") {
        super(message, "NETWORK_ERROR");
        this.name = "NetworkError";
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
