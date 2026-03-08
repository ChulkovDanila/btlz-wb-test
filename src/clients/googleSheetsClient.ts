import { google, sheets_v4 } from "googleapis";
import { appConfig } from "#config/app.js";

function getAuthClient(): InstanceType<typeof google.auth.JWT> {
    const { serviceAccountClientEmail, serviceAccountPrivateKey, serviceAccountProjectId } = appConfig.googleSheets;

    if (!serviceAccountClientEmail || !serviceAccountPrivateKey) {
        throw new Error("Google service account credentials are not configured");
    }

    return new google.auth.JWT({
        email: serviceAccountClientEmail,
        key: serviceAccountPrivateKey.replace(/\\n/g, "\n"),
        keyFile: undefined,
        subject: undefined,
        projectId: serviceAccountProjectId ?? undefined,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
}

export class GoogleSheetsClient {
    private readonly api: sheets_v4.Sheets;

    constructor() {
        this.api = google.sheets({
            version: "v4",
            auth: getAuthClient(),
        });
    }

    async clearRange(spreadsheetId: string, range: string): Promise<void> {
        await this.api.spreadsheets.values.clear({
            spreadsheetId,
            range,
        });
    }

    async batchUpdate(spreadsheetId: string, range: string, values: string[][]): Promise<void> {
        await this.api.spreadsheets.values.batchUpdate({
            spreadsheetId,
            requestBody: {
                valueInputOption: appConfig.googleSheets.valueInputOption,
                data: [
                    {
                        range,
                        majorDimension: "ROWS",
                        values,
                    },
                ],
            },
        });
    }
}
