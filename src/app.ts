import { GoogleSheetsClient } from "#clients/googleSheetsClient.js";
import { WbTariffsClient } from "#clients/wbTariffsClient.js";
import { appConfig } from "#config/app.js";
import { runNonOverlappingNow, scheduleNonOverlappingJob } from "#jobs/scheduler.js";
import { migrate, seed } from "#postgres/knex.js";
import { SpreadsheetsRepository } from "#repositories/spreadsheetsRepository.js";
import { WbTariffsRepository } from "#repositories/wbTariffsRepository.js";
import { startHealthServer } from "#server/healthServer.js";
import { GoogleSheetsSyncService } from "#services/googleSheetsSyncService.js";
import { WbTariffsIngestionService } from "#services/wbTariffsIngestionService.js";

async function main(): Promise<void> {
    await migrate.latest();
    await seed.run();

    const wbTariffsRepository = new WbTariffsRepository();
    const spreadsheetsRepository = new SpreadsheetsRepository();
    await spreadsheetsRepository.ensureBootstrapRows(appConfig.googleSheets.bootstrapSpreadsheetIds);

    const ingestionService = new WbTariffsIngestionService(new WbTariffsClient(), wbTariffsRepository);

    const canUseGoogleClient = Boolean(
        appConfig.googleSheets.serviceAccountClientEmail && appConfig.googleSheets.serviceAccountPrivateKey,
    );
    const sheetsSyncService = canUseGoogleClient
        ? new GoogleSheetsSyncService(new GoogleSheetsClient(), spreadsheetsRepository, wbTariffsRepository)
        : null;

    startHealthServer(appConfig.healthPort);

    if (appConfig.workerRunOnStartup) {
        await runNonOverlappingNow("wb-ingest", async () => {
            await ingestionService.run(new Date());
        });

        if (sheetsSyncService) {
            await runNonOverlappingNow("sheets-sync", async () => {
                await sheetsSyncService.run();
            });
        } else {
            console.log("[sheets-sync] skipped: google credentials not configured");
        }
    }

    scheduleNonOverlappingJob("wb-ingest", appConfig.ingestIntervalMs, async () => {
        await ingestionService.run(new Date());
    });

    if (sheetsSyncService) {
        scheduleNonOverlappingJob("sheets-sync", appConfig.sheetsSyncIntervalMs, async () => {
            await sheetsSyncService.run();
        });
    } else {
        console.log("[sheets-sync] scheduler disabled: google credentials not configured");
    }
}

main().catch((error: unknown) => {
    console.error("Application startup failed", error);
    process.exit(1);
});