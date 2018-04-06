import debug from './debug';

export const createStreamWriter = (formatter, streamSupplier, entrySeparator) => {

    return logEntry => {

        debug('stream log entry: %o', logEntry);

        const stream = streamSupplier(logEntry);

        if (!stream) {
            debug('streaming ended for log entry');
            return;
        }

        if (logEntry) {
            stream.write(formatter(logEntry));
            stream.write(entrySeparator);
        }
    };
};
