import { Writable } from 'stream';

interface ITickTemplate<R> {
    (levelTpls: string[], ...levelPlaceholders: any[]): R;
}

interface ILoggerObject {
    set: (key: string, value: any) => void | object;
    branch(): TLogger;
}

type LogFn = ITickTemplate<ITickTemplate<void>>;

type TLogger = ILoggerObject & LogFn;

interface ILogSystem {
    createLogger(context?: object): TLogger;
}

export class LogSystem {
    constructor(timestampProvider?: () => number);

    addAppender(appender: any): void;
    removeAppender(appender: any): void;

    createLogger(context?: object): TLogger;
    log(...args: any[]);
}

interface ILogEntry {
    name: string,
    logTimestamp: number,
    logLevel: string,
    logMessage: string,
    context: object
}

type TTransformer = (
    name: string,
    logTimestamp: number,
    context: object,
    levelTpls: string[],
    levelPlaceholders: any[],
    msgTpls: string[],
    msgPlaceholders: any[]
) => ILogEntry;

type TFormatter = (logEntry: ILogEntry) => string;

type TWriter = (logEntry: ILogEntry) => void;
type TLogEntryEval = (logEntry: ILogEntry) => boolean;
type TStreamForEntry = (logEntry: ILogEntry) => Writable;

export function createExpressMiddleware(createLogger: () => TLogger): void;

export function createCoalesceTransformer(writeFn: TWriter): TTransformer;
export function createSeparateTransformer(writeFn: TWriter): TTransformer;

export function createConsoleWriter(
    formatter: TFormatter,
    mapper: any
): TWriter;

export function createStreamWriter(
    formatter: TFormatter,
    streamSupplier: TStreamForEntry,
    entrySeparator: any
): TWriter;




export function createRangeRotation(millis: number): TLogEntryEval;

export function createRotationStreamSupplier(
    streamForEntry: TStreamForEntry,
    shouldStreamRotate: TLogEntryEval
): TStreamForEntry;

export function createStreamForEntrySupplier(
    timestampToFilePath: (timestamp: number) => string
): TStreamForEntry;


export function createJsonFormatter(
    timestampToString: (timestamp: number) => string
): TFormatter;

export function createToStringFormatter(
    timestampToString: (timestamp: number) => string
): TFormatter;

