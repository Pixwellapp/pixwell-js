import type {
    PixwellClientOptions,
    ScreenshotOptions,
    ScreenshotResponse,
    BatchOptions,
    BatchResponse,
    UsageResponse,
} from "./types";
import {
    PixwellError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    CaptureError,
    NetworkError,
} from "./errors";

const DEFAULT_BASE_URL = "https://api.pixwell.dev";
const DEFAULT_TIMEOUT = 60000;

/**
 * Pixwell API client for capturing screenshots
 *
 * @example
 * ```typescript
 * import { Pixwell } from 'pixwell';
 *
 * const client = new Pixwell({ apiKey: 'your-api-key' });
 *
 * // Capture a screenshot
 * const screenshot = await client.screenshot({
 *   url: 'https://example.com',
 *   width: 1920,
 *   height: 1080,
 *   format: 'png'
 * });
 *
 * // Save to file (Node.js)
 * import fs from 'fs';
 * fs.writeFileSync('screenshot.png', screenshot.data);
 * ```
 */
export class Pixwell {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor(options: PixwellClientOptions) {
        if (!options.apiKey) {
            throw new ValidationError("API key is required", "apiKey");
        }

        this.apiKey = options.apiKey;
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
        this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    }

    /**
     * Capture a screenshot of a webpage
     *
     * @param options - Screenshot options
     * @returns Screenshot response with image data
     * @throws {ValidationError} If parameters are invalid
     * @throws {AuthenticationError} If API key is invalid
     * @throws {RateLimitError} If rate limit is exceeded
     * @throws {CaptureError} If screenshot capture fails
     *
     * @example
     * ```typescript
     * const screenshot = await client.screenshot({
     *   url: 'https://example.com',
     *   width: 1280,
     *   height: 720,
     *   fullPage: false,
     *   format: 'png'
     * });
     * ```
     */
    async screenshot(options: ScreenshotOptions): Promise<ScreenshotResponse> {
        const response = await this.request<ArrayBuffer>(
            "/api/v1/screenshot",
            {
                method: "POST",
                body: JSON.stringify(options),
                responseType: "arrayBuffer",
            }
        );

        return {
            data: Buffer.from(response.data),
            contentType:
                response.headers.get("content-type") ?? "application/octet-stream",
            size: response.data.byteLength,
            durationMs: parseInt(
                response.headers.get("x-duration-ms") ?? "0",
                10
            ),
            cached: response.headers.get("x-cache") === "HIT",
        };
    }

    /**
     * Capture multiple screenshots in a single request
     *
     * @param options - Batch options with URLs and shared settings
     * @returns Batch response with results for each URL
     * @throws {ValidationError} If parameters are invalid
     * @throws {AuthenticationError} If API key is invalid
     * @throws {RateLimitError} If rate limit is exceeded
     *
     * @example
     * ```typescript
     * const batch = await client.batch({
     *   urls: ['https://example.com', 'https://google.com'],
     *   options: { width: 1280, height: 720, format: 'png' }
     * });
     *
     * for (const result of batch.results) {
     *   if (result.success) {
     *     const buffer = Buffer.from(result.data!, 'base64');
     *     fs.writeFileSync(`${result.url}.png`, buffer);
     *   }
     * }
     * ```
     */
    async batch(options: BatchOptions): Promise<BatchResponse> {
        const response = await this.request<BatchResponse>("/api/v1/batch", {
            method: "POST",
            body: JSON.stringify(options),
            responseType: "json",
        });

        return response.data;
    }

    /**
     * Get current usage statistics
     *
     * @returns Usage statistics including daily and monthly limits
     *
     * @example
     * ```typescript
     * const usage = await client.usage();
     * console.log(`Daily: ${usage.daily.used}/${usage.daily.limit}`);
     * console.log(`Monthly: ${usage.monthly.used}/${usage.monthly.limit}`);
     * ```
     */
    async usage(): Promise<UsageResponse> {
        const response = await this.request<UsageResponse>("/api/v1/usage", {
            method: "GET",
            responseType: "json",
        });

        return response.data;
    }

    /**
     * Make an authenticated request to the API
     */
    private async request<T>(
        path: string,
        options: {
            method: "GET" | "POST";
            body?: string;
            responseType: "json" | "arrayBuffer";
        }
    ): Promise<{ data: T; headers: Headers }> {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method: options.method,
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "User-Agent": "pixwell-js/1.0.0",
                },
                body: options.body,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleError(response);
            }

            let data: T;
            if (options.responseType === "arrayBuffer") {
                data = (await response.arrayBuffer()) as T;
            } else {
                data = (await response.json()) as T;
            }

            return { data, headers: response.headers };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof PixwellError) {
                throw error;
            }

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    throw new NetworkError(`Request timed out after ${this.timeout}ms`);
                }
                throw new NetworkError(error.message);
            }

            throw new NetworkError("Unknown error occurred");
        }
    }

    /**
     * Handle error responses from the API
     */
    private async handleError(response: Response): Promise<never> {
        let errorData: { error?: { code?: string; message?: string } } = {};

        try {
            errorData = await response.json();
        } catch {
            // Response is not JSON
        }

        const message =
            errorData.error?.message ?? `Request failed with status ${response.status}`;
        const code = errorData.error?.code ?? "UNKNOWN_ERROR";

        switch (response.status) {
            case 401:
                throw new AuthenticationError(message);
            case 429: {
                const retryAfter = response.headers.get("retry-after");
                throw new RateLimitError(
                    message,
                    retryAfter ? parseInt(retryAfter, 10) : undefined
                );
            }
            case 400:
                throw new ValidationError(message);
            case 500:
            case 502:
            case 503:
                throw new CaptureError(message);
            default:
                throw new PixwellError(message, code, response.status);
        }
    }
}
