import knex from "#postgres/knex.js";
import { WbBoxTariffDailyRecord } from "#types/tariffs.js";

type TariffDbRow = {
    tariff_date: string;
    dt_next_box: string | null;
    dt_till_max: string | null;
    warehouse_name: string;
    geo_name: string | null;
    box_delivery_base: number | null;
    box_delivery_coef_expr: number;
    box_delivery_liter: number | null;
    box_delivery_marketplace_base: number | null;
    box_delivery_marketplace_coef_expr: number | null;
    box_delivery_marketplace_liter: number | null;
    box_storage_base: number | null;
    box_storage_coef_expr: number | null;
    box_storage_liter: number | null;
    source_updated_at: Date;
    updated_at?: Date;
};

function toDbRow(record: WbBoxTariffDailyRecord): TariffDbRow {
    return {
        tariff_date: record.tariffDate,
        dt_next_box: record.dtNextBox,
        dt_till_max: record.dtTillMax,
        warehouse_name: record.warehouseName,
        geo_name: record.geoName,
        box_delivery_base: record.boxDeliveryBase,
        box_delivery_coef_expr: record.boxDeliveryCoefExpr,
        box_delivery_liter: record.boxDeliveryLiter,
        box_delivery_marketplace_base: record.boxDeliveryMarketplaceBase,
        box_delivery_marketplace_coef_expr: record.boxDeliveryMarketplaceCoefExpr,
        box_delivery_marketplace_liter: record.boxDeliveryMarketplaceLiter,
        box_storage_base: record.boxStorageBase,
        box_storage_coef_expr: record.boxStorageCoefExpr,
        box_storage_liter: record.boxStorageLiter,
        source_updated_at: record.sourceUpdatedAt,
    };
}

export class WbTariffsRepository {
    async upsertMany(records: WbBoxTariffDailyRecord[]): Promise<number> {
        if (records.length === 0) {
            return 0;
        }

        const rows = records.map(toDbRow);
        await knex("wb_box_tariffs_daily")
            .insert(rows)
            .onConflict(["tariff_date", "warehouse_name"])
            .merge({
                dt_next_box: knex.ref("excluded.dt_next_box"),
                dt_till_max: knex.ref("excluded.dt_till_max"),
                geo_name: knex.ref("excluded.geo_name"),
                box_delivery_base: knex.ref("excluded.box_delivery_base"),
                box_delivery_coef_expr: knex.ref("excluded.box_delivery_coef_expr"),
                box_delivery_liter: knex.ref("excluded.box_delivery_liter"),
                box_delivery_marketplace_base: knex.ref("excluded.box_delivery_marketplace_base"),
                box_delivery_marketplace_coef_expr: knex.ref("excluded.box_delivery_marketplace_coef_expr"),
                box_delivery_marketplace_liter: knex.ref("excluded.box_delivery_marketplace_liter"),
                box_storage_base: knex.ref("excluded.box_storage_base"),
                box_storage_coef_expr: knex.ref("excluded.box_storage_coef_expr"),
                box_storage_liter: knex.ref("excluded.box_storage_liter"),
                source_updated_at: knex.ref("excluded.source_updated_at"),
                updated_at: knex.fn.now(),
            });

        return records.length;
    }

    async getLatestTariffsSorted(): Promise<TariffDbRow[]> {
        const latest = await knex("wb_box_tariffs_daily").max<{ max: string | null }>("tariff_date as max").first();
        if (!latest?.max) {
            return [];
        }

        const rows = await knex("wb_box_tariffs_daily")
            .select<TariffDbRow[]>([
                "tariff_date",
                "dt_next_box",
                "dt_till_max",
                "warehouse_name",
                "geo_name",
                "box_delivery_base",
                "box_delivery_coef_expr",
                "box_delivery_liter",
                "box_delivery_marketplace_base",
                "box_delivery_marketplace_coef_expr",
                "box_delivery_marketplace_liter",
                "box_storage_base",
                "box_storage_coef_expr",
                "box_storage_liter",
                "source_updated_at",
            ])
            .where({ tariff_date: latest.max })
            .orderBy("box_delivery_coef_expr", "asc")
            .orderBy("warehouse_name", "asc");

        return rows;
    }
}
