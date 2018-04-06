import debug from './debug';

export const createRangeRotation = millis => {
    if (typeof millis !== 'number') {
        throw new TypeError('expected number for millis');
    }

    let lastRange = NaN;

    return logEntry => {

        let currentRange = NaN;
        if (logEntry && typeof logEntry.logTimestamp === 'number') {
            currentRange = Math.trunc(logEntry.logTimestamp / millis);
        }
        
        if (lastRange === currentRange) {
            debug('no rotation, ranges are equal: %d', currentRange);
            return false;
        }

        debug('should rotate, ranges are different: last %d, current %d', lastRange, currentRange);
        
        lastRange = currentRange;
        return true;
    };
};
