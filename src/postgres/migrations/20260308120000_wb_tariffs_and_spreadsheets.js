/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable("spreadsheets", (table) => {
        table.string("sheet_name").notNullable().defaultTo("stocks_coefs");
        table.boolean("is_active").notNullable().defaultTo(true);
        table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("wb_box_tariffs_daily", (table) => {
        table.bigIncrements("id").primary();
        table.date("tariff_date").notNullable();
        table.date("dt_next_box").nullable();
        table.date("dt_till_max").nullable();
        table.string("warehouse_name").notNullable();
        table.string("geo_name").nullable();
        table.decimal("box_delivery_base", 14, 4).nullable();
        table.decimal("box_delivery_coef_expr", 14, 4).notNullable().defaultTo(0);
        table.decimal("box_delivery_liter", 14, 4).nullable();
        table.decimal("box_delivery_marketplace_base", 14, 4).nullable();
        table.decimal("box_delivery_marketplace_coef_expr", 14, 4).nullable();
        table.decimal("box_delivery_marketplace_liter", 14, 4).nullable();
        table.decimal("box_storage_base", 14, 4).nullable();
        table.decimal("box_storage_coef_expr", 14, 4).nullable();
        table.decimal("box_storage_liter", 14, 4).nullable();
        table.timestamp("source_updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

        table.unique(["tariff_date", "warehouse_name"], {
            indexName: "wb_box_tariffs_daily_tariff_date_warehouse_name_uq",
        });
    });

    await knex.schema.alterTable("wb_box_tariffs_daily", (table) => {
        table.index(["tariff_date"], "wb_box_tariffs_daily_tariff_date_idx");
        table.index(["tariff_date", "box_delivery_coef_expr"], "wb_box_tariffs_daily_tariff_date_coef_idx");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists("wb_box_tariffs_daily");

    await knex.schema.alterTable("spreadsheets", (table) => {
        table.dropColumns("sheet_name", "is_active", "created_at", "updated_at");
    });
}
