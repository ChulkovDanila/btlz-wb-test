/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    const spreadsheetIds = (process.env.GOOGLE_SPREADSHEET_IDS ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    if (spreadsheetIds.length === 0) {
        return;
    }

    const rows = spreadsheetIds.map((spreadsheetId) => ({
        spreadsheet_id: spreadsheetId,
        sheet_name: "stocks_coefs",
        is_active: true,
    }));

    await knex("spreadsheets").insert(rows).onConflict(["spreadsheet_id"]).merge({
        sheet_name: "stocks_coefs",
        is_active: true,
        updated_at: knex.fn.now(),
    });
}
