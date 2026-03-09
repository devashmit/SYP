/**
 * Custom API Client for Sahayogi
 * Handles robust JSON parsing, timeouts, and detailed error diagnostics.
 */

const DEFAULT_TIMEOUT = 60000; // 60 seconds for large uploads

interface ApiOptions extends RequestInit {
    timeout?: number;
}

export async function apiFetch(url: string, options: ApiOptions = {}) {
    const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const finalOptions = {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
            ...fetchOptions.headers,
        },
    };

    try {
        const response = await fetch(url, finalOptions);
        clearTimeout(id);

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Handle non-JSON responses (often HTML error pages)
            const text = await response.text();
            const preview = text.slice(0, 200).replace(/<[^>]*>?/gm, ''); // Strip tags for preview

            if (!response.ok) {
                throw new Error(
                    `Expected JSON but received ${contentType || 'unknown'}. \n` +
                    `Status: ${response.status} ${response.statusText}\n` +
                    `Preview: ${preview}...`
                );
            }
            data = text;
        }

        if (!response.ok) {
            const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error: any) {
        clearTimeout(id);

        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout / 1000}s. The payload might be too large for the current connection.`);
        }

        if (error.message === 'Failed to fetch') {
            // Enhanced diagnostics for network errors
            console.error('Detailed Network Error Diagnostics:', {
                url,
                method: options.method || 'GET',
                online: navigator.onLine,
                timestamp: new Date().toISOString(),
                payloadSize: options.body ? (typeof options.body === 'string' ? options.body.length : 'unknown') : 0
            });
            throw new Error(
                `Failed to connect to the server. Please check:\n` +
                `1. Is the backend running at ${new URL(url).origin}?\n` +
                `2. Do you have a stable internet connection?\n` +
                `3. Is there a CORS or HTTPS/HTTP mismatch?`
            );
        }

        throw error;
    }
}
