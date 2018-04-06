
export const createJsonFormatter = timestampToString => logEntry => {
    return JSON.stringify({
        ...logEntry,
        logTimestamp: timestampToString(logEntry.logTimestamp)
    });
};
