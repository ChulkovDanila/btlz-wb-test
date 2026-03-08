import knex from "#postgres/knex.js";
import { SpreadsheetTarget } from "#types/tariffs.js";

type SpreadsheetRow = {
    spreadsheet_id: string;
    sheet_name: string;
};

export class SpreadsheetsRepository {
    async ensureBootstrapRows(spreadsheetIds: string[]): Promise<void> {
        if (spreadsheetIds.length === 0) {
            return;
        }

        const rows = spreadsheetIds.map((spreadsheetId) => ({
            spreadsheet_id: spreadsheetId,
            sheet_name: "stocks_coefs",
            is_active: true,
        }));

        await knex("spreadsheets").insert(rows).onConflict(["spreadsheet_id"]).merge({
            is_active: true,
            updated_at: knex.fn.now(),
        });
    }

    async listActive(): Promise<SpreadsheetTarget[]> {
        const rows = await knex("spreadsheets")
            .select<SpreadsheetRow[]>(["spreadsheet_id", "sheet_name"])
            .where({ is_active: true })
            .orderBy("spreadsheet_id", "asc");

        return rows.map((row) => ({
            spreadsheetId: row.spreadsheet_id,
            sheetName: row.sheet_name,
        }));
    }
}
