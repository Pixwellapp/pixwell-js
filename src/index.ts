// Main client
export { Pixwell } from "./client";

// Types
export type {
    PixwellClientOptions,
    ScreenshotOptions,
    ScreenshotResponse,
    BatchOptions,
    BatchResponse,
    BatchResultItem,
    UsageResponse,
} from "./types";

// Errors
export {
    PixwellError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    CaptureError,
    NetworkError,
} from "./errors";
