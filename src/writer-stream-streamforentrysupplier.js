import fs from 'fs';
import {EventEmitter} from 'events';
import debug from './debug';

export const createStreamForEntrySupplier = timestampToFilePath => {
    let lastStream, lastFilePath;

    let closed = false;
    let openStreams = 0;
    const streamEmitter = new EventEmitter();

    streamEmitter.on('close', () => {
        debug('all streams closed');
    });

    const checkClosed = () => {
        if (openStreams === 0) {
            streamEmitter.emit('close');
        }
    };

    const fn = logEntry => {
        if (closed) {
            return;
        }

        const filePath = timestampToFilePath(logEntry.logTimestamp);

        if (lastStream) {
            debug('close last stream: %s', lastFilePath);
            lastStream.end();
        }

        debug('create write stream: %s', filePath);
        const stream = lastStream = fs.createWriteStream(filePath, {flags: 'a+'});
        openStreams++;
        lastStream.once('open', () => {
            debug('stream %s opened', filePath);
        });
        lastStream.once('error', () => {
            stream.end();
        });
        lastStream.once('close', () => {
            openStreams--;
            debug('stream %s closed', filePath);
            checkClosed();
        });
        lastFilePath = filePath;
        return lastStream;
    };

    fn.close = cb => {
        closed = true;

        if (openStreams === 0) {
            process.nextTick(() => cb());
            return;
        }

        streamEmitter.once('close', () => cb());

        if (lastStream) {
            lastStream.end();
        }
    };

    return fn;
};
