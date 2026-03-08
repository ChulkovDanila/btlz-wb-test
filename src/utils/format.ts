const SPACE_GROUP_SEPARATOR = /\s+/g;

export function parseWbDecimal(value: string | undefined): number | null {
    if (!value) {
        return null;
    }

    const normalized = value.replace(SPACE_GROUP_SEPARATOR, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);

    if (Number.isNaN(parsed)) {
        return null;
    }

    return parsed;
}

export function toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
}
