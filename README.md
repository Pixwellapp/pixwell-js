# Pixwell JavaScript SDK

Official JavaScript/TypeScript SDK for the [Pixwell Screenshot API](https://pixwell.dev).

## Installation

```bash
npm install pixwell
# or
yarn add pixwell
# or
pnpm add pixwell
```

## Quick Start

```typescript
import { Pixwell } from 'pixwell';

const client = new Pixwell({
  apiKey: 'your-api-key'
});

// Capture a screenshot
const screenshot = await client.screenshot({
  url: 'https://example.com',
  width: 1920,
  height: 1080,
  format: 'png'
});

// Save to file (Node.js)
import fs from 'fs';
fs.writeFileSync('screenshot.png', screenshot.data);
```

## API Reference

### Constructor

```typescript
const client = new Pixwell({
  apiKey: string;      // Required: Your API key
  baseUrl?: string;    // Optional: API base URL (default: "https://api.pixwell.dev")
  timeout?: number;    // Optional: Request timeout in ms (default: 60000)
});
```

### Methods

#### `screenshot(options): Promise<ScreenshotResponse>`

Capture a screenshot of a webpage.

```typescript
const screenshot = await client.screenshot({
  url: 'https://example.com',  // Required: URL to capture
  width: 1280,                  // Optional: Viewport width (default: 1280)
  height: 720,                  // Optional: Viewport height (default: 720)
  fullPage: false,              // Optional: Capture full page (default: false)
  format: 'png',                // Optional: 'png' | 'jpeg' | 'webp' (default: 'png')
  quality: 80,                  // Optional: Image quality 1-100 (default: 80)
  mobile: false,                // Optional: Emulate mobile (default: false)
  darkMode: false,              // Optional: Enable dark mode (default: false)
  delay: 0,                     // Optional: Wait before capture in ms (max: 10000)
  selector: undefined,          // Optional: CSS selector to capture
  cacheTtl: 0                   // Optional: Cache TTL in seconds (max: 3600)
});

// Response
{
  data: Buffer;           // Screenshot image data
  contentType: string;    // e.g., "image/png"
  size: number;           // Image size in bytes
  durationMs: number;     // Capture duration
  cached: boolean;        // Whether served from cache
}
```

#### `batch(options): Promise<BatchResponse>`

Capture multiple screenshots in a single request.

```typescript
const batch = await client.batch({
  urls: ['https://example.com', 'https://google.com'],
  options: {
    width: 1280,
    height: 720,
    format: 'png'
  }
});

// Process results
for (const result of batch.results) {
  if (result.success) {
    const buffer = Buffer.from(result.data!, 'base64');
    fs.writeFileSync(`screenshot-${result.url}.png`, buffer);
  } else {
    console.error(`Failed: ${result.url} - ${result.error?.message}`);
  }
}
```

#### `usage(): Promise<UsageResponse>`

Get current usage statistics.

```typescript
const usage = await client.usage();

console.log(`Daily: ${usage.daily.used}/${usage.daily.limit}`);
console.log(`Monthly: ${usage.monthly.used}/${usage.monthly.limit}`);
```

## Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import {
  Pixwell,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  CaptureError,
  NetworkError
} from 'pixwell';

try {
  const screenshot = await client.screenshot({ url: 'https://example.com' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.error(`Invalid parameter: ${error.message}`);
  } else if (error instanceof CaptureError) {
    console.error(`Capture failed: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error(`Network error: ${error.message}`);
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions.

```typescript
import type {
  ScreenshotOptions,
  ScreenshotResponse,
  BatchOptions,
  BatchResponse,
  UsageResponse
} from 'pixwell';
```

## License

MIT
