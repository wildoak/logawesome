# logawesome

![npm](https://img.shields.io/npm/v/logawesome.svg)
![node](https://img.shields.io/node/v/logawesome.svg)

![Travis branch](https://img.shields.io/travis/wildoak/logawesome/master.svg)
![Coveralls github](https://img.shields.io/coveralls/github/wildoak/logawesome.svg)

![license](https://img.shields.io/github/license/wildoak/logawesome.svg)
![GitHub tag](https://img.shields.io/github/tag/wildoak/logawesome.svg)
![GitHub issues](https://img.shields.io/github/issues/wildoak/logawesome.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/wildoak/logawesome.svg)
![GitHub top language](https://img.shields.io/github/languages/top/wildoak/logawesome.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/wildoak/logawesome.svg)

- [npm](https://www.npmjs.com/package/logawesome)
- [GitHub](https://github.com/wildoak/logawesome)

`logawesome` is a rudimentary logging implementation and still WIP.

## Why another Logger?

Some loggers are doing too much or specific work.

`logawesome` is:
- **not having one global logging configuration**, but multiple if desired
- **syntactic sugar easy to use** logger
- **minimal functional interface** for dispatching to so called **appenders**
- **unrestricted** in terms of *log levels* or *log messages*

Example:

```js
logger `INFO` `connecting to ${{url: 'https://...'}}`;
```


## Usage

`npm install logawesome`

We use npm package `debug`. To make me verbose use `DEBUG=logawesome`.


### Creating a log system

```js
import {LogSystem} from 'logawesome';

const logSystem = new LogSystem();
logSystem.addAppender(appender1);
logSystem.addAppender(appender2);
logSystem.addAppender(appender2);
```


### Console Appender

Using `moment` as date formatter.

```js
import {createConsoleAppender} from 'logawesome';

const appender = createConsoleAppender({
    timestampToString: timestamp => moment(timestamp).format('HH:mm:ss.SSS')
});

logSystem.addAppender(appender);
```

### File Stream Appender

```js
import {createFileStreamAppender} from 'logawesome';

const appender = createFileStreamAppender({
    timestampToString: timestamp => moment(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS'),
    timestampToFilepath: timestamp => path.join('logs', moment(timestamp).format(`[applogs_]YYYY-MM-DD[.${workerName}.json.log]`))
});

logSystem.addAppender(appender);
```


### How it works

A logger can be invoked like this:

```js
logger `INFO` `connecting to ${{url: 'https://...'}}`;
```

The `LogSystem` invokes all appenders deferred (`process.nextTick`). Log message is enhanced with:
- a timestamp (whatever you passed to `new LogSystem(timestampFn)`, or `Date.now()` per default)
- an existing immutable context, updated by `logger.set(...)` or branched by `logger.branch()`

An `Appender` simply is a function, taking **6 arguments**:
- **timestamp**: *number*, produced by `LogSystem`
- **context**: *object*, immutable context of the log entry
- **levelTpls**: *array of strings*, first parameter of a template string
- **levelPlaceholders**: *array*, second parameter of a template string
- **msgTpls**: *array of strings*, first parameter of a template string
- **msgPlaceholders**: *array*, second parameter of a template string

It's the appender's responsibility to aggregate information.
At current `logawesome` is shipping with 2 appenders.
- **file stream appender**: writing logs to time dependant rotating files
- **console appender**: writing logs to console

Both using composition:
`Appender = Transformer -> Formatter -> Writer`

- **Transformer**: context aggregation according to template string
- **Formatter**: produces log message
- **Writer**: writes it to the target


## Plans

- micro packages, move appender logic to external packages
- ELK stack support
- syslog support