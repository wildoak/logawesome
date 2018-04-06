import debug from './debug';

export const createRotationStreamSupplier = (streamForEntry, shouldStreamRotate) => {

    let stream;

    return logEntry => {

        if (shouldStreamRotate(logEntry)) {
            debug('stream rotates for entry: %o', logEntry);
            stream = null;
        } else {
            debug('no stream rotation for entry: %o', logEntry);
        }

        if (!stream) {
            debug('requesting new stream for entry: %o', logEntry);
            stream = streamForEntry(logEntry);
        }

        return stream;
    };
};
