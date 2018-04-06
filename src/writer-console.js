import debug from './debug';

const consoleLog = (logLevel, ...args) => {
    switch (logLevel) {
        case 'DEBUG':
            console.log(...args); // eslint-disable-line no-console
            break;
        case 'INFO':
            console.info(...args); // eslint-disable-line no-console
            break;
        case 'WARN':
            console.warn(...args); // eslint-disable-line no-console
            break;
        case 'ERROR':
            console.error(...args); // eslint-disable-line no-console
            break;
        default:
            debug('unknown logLevel %s, will not log %o', logLevel, args);
    }
};

export const createConsoleWriter = (formatter, mapper = logLevel => logLevel) => {

    if (typeof formatter !== 'function') {
        throw new TypeError('expected function as formatter');
    }

    // not a function but the mapping itself
    if (typeof mapper === 'object') {
        const mapping = mapper;
        mapper = logLevel => mapping[logLevel];
    }

    return logEntry => {
        const logLevel = logEntry.logLevel;
        consoleLog(mapper(logLevel), formatter(logEntry));
    };
};
