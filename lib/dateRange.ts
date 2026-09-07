// All order/payment timestamps are stored as UTC timestamptz, but the
// business operates on IST. "Today" for a report must mean the IST
// calendar day, not the UTC one — without this, anything queried
// between 12:00am–5:30am IST would silently fall into "yesterday".
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns [startUtcIso, endUtcIso) for the given number of trailing
// days, anchored to IST day boundaries. daysBack=0 means "today only".
export function getIstDateRangeUtc(daysBack: number): { startUtc: string; endUtc: string } {
    const nowUtcMs = Date.now();
    const nowIstMs = nowUtcMs + IST_OFFSET_MS;
    const nowIst = new Date(nowIstMs);

    // Midnight IST today, expressed by zeroing the UTC-shifted clock.
    const istMidnightMs = Date.UTC(
        nowIst.getUTCFullYear(),
        nowIst.getUTCMonth(),
        nowIst.getUTCDate()
    );

    const startIstMs = istMidnightMs - daysBack * 24 * 60 * 60 * 1000;
    const endIstMs = istMidnightMs + 24 * 60 * 60 * 1000; // exclusive upper bound: start of tomorrow IST

    return {
        startUtc: new Date(startIstMs - IST_OFFSET_MS).toISOString(),
        endUtc: new Date(endIstMs - IST_OFFSET_MS).toISOString(),
    };
}

// Bucket a UTC timestamp into its IST calendar date, as 'YYYY-MM-DD'.
export function toIstDateKey(utcIso: string): string {
    const istMs = new Date(utcIso).getTime() + IST_OFFSET_MS;
    return new Date(istMs).toISOString().slice(0, 10);
}