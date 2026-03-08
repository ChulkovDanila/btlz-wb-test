import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const stringToNumber = z.string().regex(/^[0-9]+$/).transform((value) => Number.parseInt(value, 10));
const stringToBoolean = z
    .string()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(["true", "false"]))
    .transform((value) => value === "true");

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production", "test"])]),
    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: stringToNumber,
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    APP_PORT: z.union([z.undefined(), stringToNumber]),

    WB_API_TOKEN: z.union([z.undefined(), z.string().min(1)]),
    WB_API_BASE_URL: z.union([z.undefined(), z.string().url()]),
    WB_API_TIMEOUT_MS: z.union([z.undefined(), stringToNumber]),
    WB_API_MAX_RETRIES: z.union([z.undefined(), stringToNumber]),

    WORKER_RUN_ON_STARTUP: z.union([z.undefined(), stringToBoolean]),
    INGEST_INTERVAL_MS: z.union([z.undefined(), stringToNumber]),
    SHEETS_SYNC_INTERVAL_MS: z.union([z.undefined(), stringToNumber]),

    GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: z.union([z.undefined(), z.string().min(1)]),
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: z.union([z.undefined(), z.string().email()]),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.union([z.undefined(), z.string().min(1)]),
    GOOGLE_SHEETS_RANGE: z.union([z.undefined(), z.string().min(1)]),
    GOOGLE_SHEETS_VALUE_INPUT_OPTION: z.union([z.undefined(), z.enum(["RAW", "USER_ENTERED"])]),
    GOOGLE_SPREADSHEET_IDS: z.union([z.undefined(), z.string()]),
});

const env = envSchema.parse({
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT,

    WB_API_TOKEN: process.env.WB_API_TOKEN,
    WB_API_BASE_URL: process.env.WB_API_BASE_URL,
    WB_API_TIMEOUT_MS: process.env.WB_API_TIMEOUT_MS,
    WB_API_MAX_RETRIES: process.env.WB_API_MAX_RETRIES,

    WORKER_RUN_ON_STARTUP: process.env.WORKER_RUN_ON_STARTUP,
    INGEST_INTERVAL_MS: process.env.INGEST_INTERVAL_MS,
    SHEETS_SYNC_INTERVAL_MS: process.env.SHEETS_SYNC_INTERVAL_MS,

    GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_SHEETS_RANGE: process.env.GOOGLE_SHEETS_RANGE,
    GOOGLE_SHEETS_VALUE_INPUT_OPTION: process.env.GOOGLE_SHEETS_VALUE_INPUT_OPTION,
    GOOGLE_SPREADSHEET_IDS: process.env.GOOGLE_SPREADSHEET_IDS,
});

export default env;
