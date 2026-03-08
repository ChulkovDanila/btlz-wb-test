import { appConfig } from "#config/app.js";
import { WbBoxTariffsApiResponse } from "#types/tariffs.js";
import { toDateOnly } from "#utils/format.js";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHeaders(token: string): HeadersInit {
    return {
        Authorization: token,
        "Content-Type": "application/json",
    };
}

export class WbTariffsClient {
    async getBoxTariffsByDate(date: Date): Promise<WbBoxTariffsApiResponse> {
        const { token, baseUrl, timeoutMs, maxRetries } = appConfig.wbApi;
        if (!token) {
            throw new Error("WB_API_TOKEN is not configured");
        }

        const dateParam = toDateOnly(date);
        const endpoint = new URL("/api/v1/tariffs/box", baseUrl);
        endpoint.searchParams.set("date", dateParam);

        const maxAttempts = Math.max(1, maxRetries + 1);
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const abortController = new AbortController();
            const timeout = setTimeout(() => abortController.abort(), timeoutMs);

            try {
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: buildHeaders(token),
                    signal: abortController.signal,
                });

                if (response.ok) {
                    const payload = (await response.json()) as WbBoxTariffsApiResponse;
                    return payload;
                }

                if ([401, 402].includes(response.status)) {
                    throw new Error(`WB API authorization error: HTTP ${response.status}`);
                }

                if (response.status === 429 && attempt < maxAttempts) {
                    await sleep(attempt * 500);
                    continue;
                }

                const bodyText = await response.text();
                throw new Error(`WB API failed with HTTP ${response.status}: ${bodyText}`);
            } catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    await sleep(attempt * 500);
                    continue;
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        throw new Error(`Unable to fetch WB box tariffs: ${String(lastError)}`);
    }
}
