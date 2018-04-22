
import {createToStringFormatter} from './formatter-tostring';
import {createConsoleWriter} from './writer-console';
import {createCoalesceTransformer} from './transformer-coalesce';

export const createConsoleAppender = ({
    timestampToString,
    logLevelMapper = logLevel => logLevel
}) => {

    const toStringFormatter = createToStringFormatter(timestampToString);
    const consoleWriter = createConsoleWriter(toStringFormatter, logLevelMapper);
    const appender = createCoalesceTransformer(consoleWriter);

    return appender;
};
