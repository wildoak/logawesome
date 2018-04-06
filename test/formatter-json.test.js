import {test} from 'ava';
import sinon from 'sinon';
import {createJsonFormatter} from '../src';

test('should format json and convert timestamp', t => {
    const timestampToStringStub = sinon.stub();
    timestampToStringStub.withArgs(7).returns(4);

    const formatter = createJsonFormatter(timestampToStringStub);
    const result = JSON.parse(formatter({
        a: 'b',
        c: 'd',
        logTimestamp: 7
    }));

    t.deepEqual(result, {a: 'b', c: 'd', logTimestamp: 4});
    
});
