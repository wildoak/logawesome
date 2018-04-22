import {createJsonFormatter} from './formatter-json';
import {createStreamForEntrySupplier} from './writer-stream-streamforentrysupplier';
import {createRangeRotation} from './writer-stream-rangerotation';
import {createRotationStreamSupplier} from './writer-stream-rotationstreamsupplier';
import {createStreamWriter} from './writer-stream';
import {createSeparateTransformer} from './transformer-separate';

export const createFileStreamAppender = ({
    timestampToString,
    timestampToFilepath,
    millisRange = 1000 * 60 * 60 * 24,
    entrySeparator = '\n'
}) => {
    const formatter = createJsonFormatter(timestampToString);

    const streamForEntry = createStreamForEntrySupplier(timestampToFilepath);
    
    const shouldStreamRotate = createRangeRotation(millisRange);
    const streamSupplier = createRotationStreamSupplier(
        streamForEntry,
        shouldStreamRotate
    );

    const streamWriter = createStreamWriter(
        formatter,
        streamSupplier,
        entrySeparator
    );

    const appender = createSeparateTransformer(streamWriter);
    appender.close = cb => streamForEntry.close(cb);

    return appender;
};
