import { WbTariffsClient } from "#clients/wbTariffsClient.js";
import { WbTariffsRepository } from "#repositories/wbTariffsRepository.js";
import { WbBoxTariffDailyRecord, WbWarehouseTariffRaw } from "#types/tariffs.js";
import { parseWbDecimal, toDateOnly } from "#utils/format.js";

function normalizeOptionalDate(value: string | undefined): string | null {
    if (!value || value.trim().length === 0) {
        return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return value;
}

function normalizeWarehouseTariff(args: {
    tariffDate: string;
    dtNextBox: string | null;
    dtTillMax: string | null;
    sourceUpdatedAt: Date;
    row: WbWarehouseTariffRaw;
}): WbBoxTariffDailyRecord {
    const { tariffDate, dtNextBox, dtTillMax, sourceUpdatedAt, row } = args;

    return {
        tariffDate,
        dtNextBox,
        dtTillMax,
        warehouseName: row.warehouseName,
        geoName: row.geoName ?? null,
        boxDeliveryBase: parseWbDecimal(row.boxDeliveryBase),
        boxDeliveryCoefExpr: parseWbDecimal(row.boxDeliveryCoefExpr) ?? 0,
        boxDeliveryLiter: parseWbDecimal(row.boxDeliveryLiter),
        boxDeliveryMarketplaceBase: parseWbDecimal(row.boxDeliveryMarketplaceBase),
        boxDeliveryMarketplaceCoefExpr: parseWbDecimal(row.boxDeliveryMarketplaceCoefExpr),
        boxDeliveryMarketplaceLiter: parseWbDecimal(row.boxDeliveryMarketplaceLiter),
        boxStorageBase: parseWbDecimal(row.boxStorageBase),
        boxStorageCoefExpr: parseWbDecimal(row.boxStorageCoefExpr),
        boxStorageLiter: parseWbDecimal(row.boxStorageLiter),
        sourceUpdatedAt,
    };
}

export class WbTariffsIngestionService {
    constructor(
        private readonly wbClient: WbTariffsClient,
        private readonly tariffsRepository: WbTariffsRepository,
    ) {}

    async run(now: Date = new Date()): Promise<number> {
        const payload = await this.wbClient.getBoxTariffsByDate(now);
        const data = payload.response?.data;
        const warehouseList = data?.warehouseList ?? [];
        const tariffDate = toDateOnly(now);
        const sourceUpdatedAt = new Date();

        const records = warehouseList
            .filter((row) => row.warehouseName)
            .map((row) =>
                normalizeWarehouseTariff({
                    tariffDate,
                    dtNextBox: normalizeOptionalDate(data?.dtNextBox),
                    dtTillMax: normalizeOptionalDate(data?.dtTillMax),
                    sourceUpdatedAt,
                    row,
                }),
            );

        const upsertedCount = await this.tariffsRepository.upsertMany(records);
        console.log(`[wb-ingest] done: upserted=${upsertedCount} date=${tariffDate}`);
        return upsertedCount;
    }
}
