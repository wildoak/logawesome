import {test} from 'ava';
import sinon from 'sinon';
import {createSeparateTransformer} from '../src';

test('should coalesce log entry', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);
    const err = new TypeError('test');
    err.stack = 'stack';

    transformer(
        0,
        {
            a: 'b'
        },
        ['TEST', 'X'],
        [5],
        ['a', 'c', 'f', 'g', 'j', 'k', 'l', 'm', 'n', 's'],
        ['b', ['d', 'e'], err, {h: 'i'}, undefined, null, [], {}, {o: 'p', q: 'r'}]
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: 'TEST${_level1}X',
        logMessage: 'a${_message1}c${_message2}fg${h}j${_message3}k${_message4}l${_message5}mn${o}, ${q}s',
        context: {
            a: 'b',
            h: 'i',
            _level1: 5,
            _message1: 'b',
            _message2: ['d', 'e'],
            _message3: undefined,
            _message4: null,
            _message5: [],
            o: 'p',
            q: 'r'
        }
    }));
});

test('should not throw on invalid input', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);

    transformer(
        0,
        {
            a: 'b'
        },
        5,
        undefined,
        5,
        undefined
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: '<invalid>',
        logMessage: '<invalid>',
        context: {
            a: 'b'
        }
    }));
});

test('should allow only strings as template', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);

    transformer(
        0,
        {
            a: 'b'
        },
        'TEST',
        undefined,
        'test',
        undefined
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: 'TEST',
        logMessage: 'test',
        context: {
            a: 'b'
        }
    }));
});

test('should allow function as placeholder', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);

    transformer(
        0,
        {
            a: 'b'
        },
        ['log', 'some'],
        [() => () => () => () => 'awe'],
        ['should ', ' functions'],
        [() => 'allow'],
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: 'log${_level1}some',
        logMessage: 'should ${_message1} functions',
        context: {
            a: 'b',
            _level1: 'awe',
            _message1: 'allow'
        }
    }));
});

test('should use different placeholder name for collision, but same if value is same', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);

    
    transformer(
        0,
        {
            a: 'b'
        },
        ['log', 'some'],
        [{a: 'awe'}],
        ['is ', 'some'],
        [{a: 'awe'}],
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: 'log${a2}some',
        logMessage: 'is ${a2}some',
        context: {
            a: 'b',
            a2: 'awe'
        }
    }));
});

test('should use <invalid> for unknown placeholder types', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createSeparateTransformer(writeFnSpy);

    
    transformer(
        0,
        {
            a: 'b'
        },
        ['symbols are ', ''],
        [Symbol('test')],
        ['really ', ''],
        [Symbol('test')],
    );

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 0,
        logLevel: 'symbols are <invalid>',
        logMessage: 'really <invalid>',
        context: {
            a: 'b'
        }
    }));
});
