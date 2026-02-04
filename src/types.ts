/**
 * Screenshot request parameters
 */
export interface ScreenshotOptions {
    /** URL to capture */
    url: string;
    /** Viewport width in pixels (default: 1280) */
    width?: number;
    /** Viewport height in pixels (default: 720) */
    height?: number;
    /** Capture full scrollable page (default: false) */
    fullPage?: boolean;
    /** Image format (default: "png") */
    format?: "png" | "jpeg" | "webp";
    /** Image quality 1-100, applies to jpeg/webp (default: 80) */
    quality?: number;
    /** Emulate mobile device (default: false) */
    mobile?: boolean;
    /** Enable dark mode (default: false) */
    darkMode?: boolean;
    /** Wait time in ms before capture (default: 0, max: 10000) */
    delay?: number;
    /** CSS selector to capture specific element */
    selector?: string;
    /** Cache TTL in seconds (default: 0, max: 3600) */
    cacheTtl?: number;
}

/**
 * Batch screenshot request
 */
export interface BatchOptions {
    /** URLs to capture (max 10) */
    urls: string[];
    /** Shared options for all screenshots */
    options?: Omit<ScreenshotOptions, "url">;
}

/**
 * Screenshot response
 */
export interface ScreenshotResponse {
    /** Screenshot image as Buffer */
    data: Buffer;
    /** Content type (e.g., "image/png") */
    contentType: string;
    /** Image size in bytes */
    size: number;
    /** Capture duration in milliseconds */
    durationMs: number;
    /** Whether the result was served from cache */
    cached: boolean;
}

/**
 * Single result in batch response
 */
export interface BatchResultItem {
    /** Original URL */
    url: string;
    /** Whether capture succeeded */
    success: boolean;
    /** Base64 encoded image data (if success) */
    data?: string;
    /** Content type (if success) */
    contentType?: string;
    /** Image size in bytes (if success) */
    size?: number;
    /** Capture duration in ms (if success) */
    durationMs?: number;
    /** Error details (if failed) */
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Batch screenshot response
 */
export interface BatchResponse {
    /** Results for each URL */
    results: BatchResultItem[];
    /** Summary statistics */
    summary: {
        total: number;
        succeeded: number;
        failed: number;
        totalDurationMs: number;
    };
}

/**
 * Usage statistics response
 */
export interface UsageResponse {
    daily: {
        used: number;
        limit: number;
        remaining: number;
    };
    monthly: {
        used: number;
        limit: number;
        remaining: number;
    };
    plan: {
        name: string;
        maxWidth: number;
        maxHeight: number;
    };
}

/**
 * Client configuration options
 */
export interface PixwellClientOptions {
    /** API key for authentication */
    apiKey: string;
    /** Base URL for the API (default: "https://api.pixwell.dev") */
    baseUrl?: string;
    /** Request timeout in milliseconds (default: 60000) */
    timeout?: number;
}
