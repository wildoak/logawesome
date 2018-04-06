
export const createToStringFormatter = timestampToString => logEntry => {
    const hasContext = logEntry.context && Object.keys(logEntry.context).length > 0;

    let contextAppendix = '';
    if (hasContext) {
        contextAppendix = ` [${JSON.stringify(logEntry.context)}]`;
    }

    const timestamp = timestampToString(logEntry.logTimestamp);

    return `${timestamp} ${logEntry.logLevel}: ${logEntry.logMessage}${contextAppendix}`;
};
