import {test} from 'ava';
import sinon from 'sinon';
import {createCoalesceTransformer} from '../src';

test('should coalesce log entry', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createCoalesceTransformer(writeFnSpy);
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
        logLevel: 'TEST5X',
        logMessage: 'abcd, efstackgij<undefined>k<null>l[]m-no=p, q=rs',
        context: {a: 'b'}
    }));
});

test('should also accept string as tpl', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createCoalesceTransformer(writeFnSpy);
    transformer(3, {}, 's1', undefined, 's2', undefined);

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 3,
        logLevel: 's1',
        logMessage: 's2',
        context: {}
    }));
});

test('should print <invalid> for invalid input', t => {
    const writeFnSpy = sinon.spy();

    const transformer = createCoalesceTransformer(writeFnSpy);
    transformer(5, {}, 6, undefined, {}, undefined);

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 5,
        logLevel: '<invalid>',
        logMessage: '<invalid>',
        context: {}
    }));
});

test('should try toString() of error', t => {
    const writeFnSpy = sinon.spy();

    const err = new TypeError();
    err.stack = undefined;
    err.toString = () => 'test';

    const err2 = new TypeError();
    err2.stack = undefined;
    err2.toString = undefined;

    const transformer = createCoalesceTransformer(writeFnSpy);
    transformer(9, {}, ['', ''], [err], ['', ''], [err2]);

    t.true(writeFnSpy.calledOnceWith({
        logTimestamp: 9,
        logLevel: 'test',
        logMessage: 'undefined',
        context: {}
    }));
});
