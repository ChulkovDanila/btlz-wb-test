import env from "#config/env/env.js";

const DEFAULT_WB_BASE_URL = "https://common-api.wildberries.ru";

export const appConfig = {
    nodeEnv: env.NODE_ENV ?? "development",
    healthPort: env.APP_PORT ?? 5000,
    workerRunOnStartup: env.WORKER_RUN_ON_STARTUP ?? true,
    ingestIntervalMs: env.INGEST_INTERVAL_MS ?? 60 * 60 * 1000,
    sheetsSyncIntervalMs: env.SHEETS_SYNC_INTERVAL_MS ?? 60 * 60 * 1000,

    wbApi: {
        token: env.WB_API_TOKEN ?? null,
        baseUrl: env.WB_API_BASE_URL ?? DEFAULT_WB_BASE_URL,
        timeoutMs: env.WB_API_TIMEOUT_MS ?? 10000,
        maxRetries: env.WB_API_MAX_RETRIES ?? 2,
    },

    googleSheets: {
        spreadsheetRange: env.GOOGLE_SHEETS_RANGE ?? "stocks_coefs!A1:Z",
        valueInputOption: env.GOOGLE_SHEETS_VALUE_INPUT_OPTION ?? "RAW",
        serviceAccountProjectId: env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID ?? null,
        serviceAccountClientEmail: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL ?? null,
        serviceAccountPrivateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? null,
        bootstrapSpreadsheetIds: (env.GOOGLE_SPREADSHEET_IDS ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
    },
} as const;
