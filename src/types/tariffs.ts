export type WbWarehouseTariffRaw = {
    boxDeliveryBase?: string;
    boxDeliveryCoefExpr?: string;
    boxDeliveryLiter?: string;
    boxDeliveryMarketplaceBase?: string;
    boxDeliveryMarketplaceCoefExpr?: string;
    boxDeliveryMarketplaceLiter?: string;
    boxStorageBase?: string;
    boxStorageCoefExpr?: string;
    boxStorageLiter?: string;
    geoName?: string;
    warehouseName: string;
};

export type WbBoxTariffsApiResponse = {
    response?: {
        data?: {
            dtNextBox?: string;
            dtTillMax?: string;
            warehouseList?: WbWarehouseTariffRaw[];
        };
    };
};

export type WbBoxTariffDailyRecord = {
    tariffDate: string;
    dtNextBox: string | null;
    dtTillMax: string | null;
    warehouseName: string;
    geoName: string | null;
    boxDeliveryBase: number | null;
    boxDeliveryCoefExpr: number;
    boxDeliveryLiter: number | null;
    boxDeliveryMarketplaceBase: number | null;
    boxDeliveryMarketplaceCoefExpr: number | null;
    boxDeliveryMarketplaceLiter: number | null;
    boxStorageBase: number | null;
    boxStorageCoefExpr: number | null;
    boxStorageLiter: number | null;
    sourceUpdatedAt: Date;
};

export type SpreadsheetTarget = {
    spreadsheetId: string;
    sheetName: string;
};
