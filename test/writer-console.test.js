import {test} from 'ava';
import sinon from 'sinon';
import {createConsoleWriter} from '../src';

test.serial('should log debug', t => {
    const formatter = sinon.stub();
    sinon.stub(console, 'log').callsFake(() => {});

    const logEntry = {logLevel: 'DEBUG'};
    formatter.withArgs(logEntry).returns('ok');
    
    const writer = createConsoleWriter(formatter);

    writer(logEntry);

    t.true(console.log.calledOnceWith('ok')); // eslint-disable-line no-console
    console.log.restore(); // eslint-disable-line no-console
});

test.serial('should log info', t => {
    const formatter = sinon.stub();
    sinon.stub(console, 'info').callsFake(() => {});

    const logEntry = {logLevel: 'INFO'};
    formatter.withArgs(logEntry).returns('ok');
    
    const writer = createConsoleWriter(formatter);

    writer(logEntry);

    t.true(console.info.calledOnceWith('ok')); // eslint-disable-line no-console
    console.info.restore(); // eslint-disable-line no-console
});

test.serial('should log warn', t => {
    const formatter = sinon.stub();
    sinon.stub(console, 'warn').callsFake(() => {});

    const logEntry = {logLevel: 'WARN'};
    formatter.withArgs(logEntry).returns('ok');
    
    const writer = createConsoleWriter(formatter);

    writer(logEntry);

    t.true(console.warn.calledOnceWith('ok')); // eslint-disable-line no-console
    console.warn.restore(); // eslint-disable-line no-console
});

test.serial('should log error', t => {
    const formatter = sinon.stub();
    sinon.stub(console, 'error').callsFake(() => {});

    const logEntry = {logLevel: 'ERROR'};
    formatter.withArgs(logEntry).returns('ok');
    
    const writer = createConsoleWriter(formatter);

    writer(logEntry);

    t.true(console.error.calledOnceWith('ok')); // eslint-disable-line no-console
    console.error.restore(); // eslint-disable-line no-console
});

test.serial('should map logLevel via function', t => {
    const formatter = sinon.stub();
    const mapper = sinon.stub();
    sinon.stub(console, 'error').callsFake(() => {});

    const logEntry = {logLevel: 'CUSTOM'};
    formatter.withArgs(logEntry).returns('ok');
    mapper.withArgs('CUSTOM').returns('ERROR');

    
    const writer = createConsoleWriter(formatter, mapper);

    writer(logEntry);

    t.true(console.error.calledOnceWith('ok')); // eslint-disable-line no-console
    console.error.restore(); // eslint-disable-line no-console
});

test.serial('should map logLevel via mapping', t => {
    const formatter = sinon.stub();
    sinon.stub(console, 'info').callsFake(() => {});

    const logEntry = {logLevel: 'CUSTOM'};
    formatter.withArgs(logEntry).returns('ok');

    
    const writer = createConsoleWriter(formatter, {
        CUSTOM: 'INFO'
    });

    writer(logEntry);

    t.true(console.info.calledOnceWith('ok')); // eslint-disable-line no-console
    console.info.restore(); // eslint-disable-line no-console
});

test.serial('should not log unknown logLevel', t => {
    const formatter = sinon.stub();
    sinon.spy(console, 'debug');
    sinon.spy(console, 'log');
    sinon.spy(console, 'info');
    sinon.spy(console, 'warn');
    sinon.spy(console, 'error');

    const logEntry = {logLevel: 'CUSTOM'};

    const writer = createConsoleWriter(formatter);

    writer(logEntry);

    t.true(console.debug.notCalled); // eslint-disable-line no-console
    console.debug.restore(); // eslint-disable-line no-console

    t.true(console.log.notCalled); // eslint-disable-line no-console
    console.log.restore(); // eslint-disable-line no-console

    t.true(console.info.notCalled); // eslint-disable-line no-console
    console.info.restore(); // eslint-disable-line no-console

    t.true(console.warn.notCalled); // eslint-disable-line no-console
    console.warn.restore(); // eslint-disable-line no-console

    t.true(console.error.notCalled); // eslint-disable-line no-console
    console.error.restore(); // eslint-disable-line no-console
});

test.serial('should throw for missing formatter', t => {
    t.throws(() => createConsoleWriter());
});
