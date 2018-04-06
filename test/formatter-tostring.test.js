import {test} from 'ava';
import sinon from 'sinon';
import {createToStringFormatter} from '../src';

test('should format with empty context', t => {
    const timestampToStringStub = sinon.stub();
    timestampToStringStub.withArgs(2).returns(66);

    const formatter = createToStringFormatter(timestampToStringStub);
    const result = formatter({
        logLevel: 'TEST',
        logTimestamp: 2,
        logMessage: 'test message',
        context: {}
    });

    t.deepEqual(result, '66 TEST: test message');
    
});

test('should format with context', t => {
    const timestampToStringStub = sinon.stub();
    timestampToStringStub.withArgs(5).returns(1);

    const formatter = createToStringFormatter(timestampToStringStub);
    const result = formatter({
        logLevel: 'TEST',
        logTimestamp: 5,
        logMessage: 'test message',
        context: {
            a: 'b',
            c: ['d', 'e']
        }
    });

    t.deepEqual(result, '1 TEST: test message [{"a":"b","c":["d","e"]}]');
    
});

test('should format with no context', t => {
    const timestampToStringStub = sinon.stub();
    timestampToStringStub.withArgs(2).returns(66);

    const formatter = createToStringFormatter(timestampToStringStub);
    const result = formatter({
        logLevel: 'TEST',
        logTimestamp: 2,
        logMessage: 'test message'
    });

    t.deepEqual(result, '66 TEST: test message');
    
});
