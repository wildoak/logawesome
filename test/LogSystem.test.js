import {test} from 'ava';
import sinon from 'sinon';

import {LogSystem} from '../src';

const tick = async () => await new Promise(resolve => process.nextTick(resolve));

test.beforeEach(t => {
    const appenderSpy = sinon.spy();
    let i = 0;
    const logSystem = new LogSystem(() => i++);
    logSystem.addAppender(appenderSpy);

    t.context = {
        logSystem,
        appenderSpy
    };
});

test('should log with log level and context', async t => {
    const {logSystem, appenderSpy} = t.context;

    const logger = logSystem.createLogger();

    logger `TEST` `test`;
    logger.set('a', 'b');
    logger.set({c: 'd'});

    await tick();
    t.true(appenderSpy.getCall(0).calledWith(0, {a: 'b', c: 'd'}, ['TEST'], [], ['test'], []));
});

test('should log with log level and context and contexts', async t => {
    const {logSystem, appenderSpy} = t.context;

    const logger = logSystem.createLogger();

    logger.set('key1', 'value1');
    logger.set({key2: 'value2', key3: 'value3'});

    logger `DEBUG ${5}` `debug ${'the'} message`;
    
    await tick();
    t.true(appenderSpy.calledOnceWith(
        0,
        {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        },
        ['DEBUG ', ''], [5],
        ['debug ', ' message'], ['the']
    ));
    
});

test('should remove appender', async t => {
    const {logSystem, appenderSpy} = t.context;

    logSystem.removeAppender(appenderSpy);

    const logger = logSystem.createLogger();

    logger `should not` `be forwarded to appender`;

    await tick();
    t.true(appenderSpy.notCalled);
});

test('should not throw if invalid appender removed', async t => {
    const {logSystem, appenderSpy} = t.context;

    logSystem.removeAppender({});
    const logger = logSystem.createLogger();

    logger `TEST` `test`;
    
    await tick();
    t.true(appenderSpy.calledOnceWith(
        0,
        {},
        ['TEST'], [],
        ['test'], []
    ));
    
});

test('should not throw if set called with illegal convention', async t => {
    const {logSystem, appenderSpy} = t.context;

    const logger = logSystem.createLogger();
    logger.set('a', 'b', 'c'); // no
    logger.set({d: 'e'}); // yes
    logger.set({f: 'g'}, 3); // no

    logger `TEST` `test`;
    
    await tick();
    t.true(appenderSpy.calledOnceWith(
        0,
        {d: 'e'},
        ['TEST'], [],
        ['test'], []
    ));
});

test('should branch, not touching contexts', async t => {
    const {logSystem, appenderSpy} = t.context;

    const logger = logSystem.createLogger();
    logger.set('a', 'b');
    const logger2 = logger.branch();
    logger2.set({c: 'd', e: 'f'});
    const logger3 = logger2.branch('test2');
    logger3.set('g', 'h');

    logger `TEST` `test`;
    logger2 `TEST` `test`;
    logger3 `TEST` `test`;

    await tick();
    t.true(appenderSpy.getCall(0).calledWith(0, {a: 'b'}, ['TEST'], [], ['test'], []));
    t.true(appenderSpy.getCall(1).calledWith(1, {a: 'b', c: 'd', e: 'f'}, ['TEST'], [], ['test'], []));
    t.true(appenderSpy.getCall(2).calledWith(2, {a: 'b', c: 'd', e: 'f', g: 'h'}, ['TEST'], [], ['test'], []));
});

test.serial('should use millis provider per default', async t => {
    const {appenderSpy} = t.context;
    const logSystem = new LogSystem();
    logSystem.addAppender(appenderSpy);

    const logger = logSystem.createLogger();
    sinon.stub(Date, 'now').returns(7);

    logger `TEST` `test`;

    await tick();
    t.true(appenderSpy.getCall(0).calledWith(7, {}, ['TEST'], [], ['test'], []));

    Date.now.restore();
});
