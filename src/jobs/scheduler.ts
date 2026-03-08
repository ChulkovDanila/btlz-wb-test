type JobRunner = () => Promise<void>;

export function scheduleNonOverlappingJob(name: string, intervalMs: number, run: JobRunner): NodeJS.Timeout {
    let isRunning = false;

    return setInterval(async () => {
        if (isRunning) {
            console.log(`[${name}] skipped: previous run still in progress`);
            return;
        }

        isRunning = true;
        console.log(`[${name}] started`);
        try {
            await run();
            console.log(`[${name}] finished`);
        } catch (error) {
            console.error(`[${name}] failed`, error);
        } finally {
            isRunning = false;
        }
    }, intervalMs);
}

export async function runNonOverlappingNow(name: string, run: JobRunner): Promise<void> {
    console.log(`[${name}] started`);
    try {
        await run();
        console.log(`[${name}] finished`);
    } catch (error) {
        console.error(`[${name}] failed`, error);
    }
}
