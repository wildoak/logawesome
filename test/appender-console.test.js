import {test} from 'ava';
import sinon from 'sinon';

import {LogSystem, createConsoleAppender} from '../src';

test.beforeEach(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'info');
    sinon.stub(console, 'warn');
    sinon.stub(console, 'error');
});

test.afterEach(() => {
    console.log.restore(); // eslint-disable-line
    console.info.restore(); // eslint-disable-line
    console.warn.restore(); // eslint-disable-line
    console.error.restore(); // eslint-disable-line
});

test.serial('should log to console', async t => {
    
    const appender = createConsoleAppender({
        timestampToString: timestamp => `TS:${timestamp}`
    });

    let i = 0;
    const logSystem = new LogSystem(() => i++);
    logSystem.addAppender(appender);

    const logger = logSystem.createLogger({a: 'a', b: 'b'});
    logger `DEBUG` `a${{b: 'c'}}d${{e: 'f'}}`;
    logger `INFO` `g${{h: 'i'}}j${{k: 'l'}}`;

    await new Promise(resolve => process.nextTick(resolve));

    t.true(console.log.calledOnceWith('TS:0 DEBUG: acdf [{"a":"a","b":"b"}]')); // eslint-disable-line
    t.true(console.info.calledOnceWith('TS:1 INFO: gijl [{"a":"a","b":"b"}]')); // eslint-disable-line
});
