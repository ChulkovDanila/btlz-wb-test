import { GoogleSheetsClient } from "#clients/googleSheetsClient.js";
import { appConfig } from "#config/app.js";
import { SpreadsheetsRepository } from "#repositories/spreadsheetsRepository.js";
import { WbTariffsRepository } from "#repositories/wbTariffsRepository.js";

function asCell(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return String(value);
}

function asDateOnlyCell(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    const normalized = String(value);
    return normalized.includes("T") ? normalized.slice(0, 10) : normalized;
}

export class GoogleSheetsSyncService {
    constructor(
        private readonly googleSheetsClient: GoogleSheetsClient,
        private readonly spreadsheetsRepository: SpreadsheetsRepository,
        private readonly tariffsRepository: WbTariffsRepository,
    ) {}

    async run(): Promise<void> {
        const targets = await this.spreadsheetsRepository.listActive();
        if (targets.length === 0) {
            console.log("[sheets-sync] skipped: no active spreadsheets");
            return;
        }

        const tariffs = await this.tariffsRepository.getLatestTariffsSorted();
        const sorted = [...tariffs].sort((a, b) => a.box_delivery_coef_expr - b.box_delivery_coef_expr);
        const configuredRange = appConfig.googleSheets.spreadsheetRange;

        const rows: string[][] = [
            [
                "tariff_date",
                "warehouse_name",
                "geo_name",
                "box_delivery_coef_expr",
                "box_delivery_base",
                "box_delivery_liter",
                "box_delivery_marketplace_coef_expr",
                "box_storage_coef_expr",
                "source_updated_at",
            ],
            ...sorted.map((row) => [
                asDateOnlyCell(row.tariff_date),
                asCell(row.warehouse_name),
                asCell(row.geo_name),
                asCell(row.box_delivery_coef_expr),
                asCell(row.box_delivery_base),
                asCell(row.box_delivery_liter),
                asCell(row.box_delivery_marketplace_coef_expr),
                asCell(row.box_storage_coef_expr),
                asCell(row.source_updated_at),
            ]),
        ];

        for (const target of targets) {
            const targetRange = configuredRange.includes("!")
                ? configuredRange
                : `${target.sheetName}!${configuredRange}`;
            try {
                await this.googleSheetsClient.clearRange(target.spreadsheetId, targetRange);
                await this.googleSheetsClient.batchUpdate(target.spreadsheetId, targetRange, rows);
                console.log(`[sheets-sync] updated spreadsheet_id=${target.spreadsheetId}`);
            } catch (error) {
                console.error(`[sheets-sync] failed spreadsheet_id=${target.spreadsheetId}`, error);
            }
        }

        console.log(`[sheets-sync] done: spreadsheets=${targets.length} rows=${rows.length - 1} range=${configuredRange}`);
    }
}
