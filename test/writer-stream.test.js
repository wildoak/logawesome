import {Writable} from 'stream';
import {test} from 'ava';
import sinon from 'sinon';
import {
    createStreamWriter,
    createToStringFormatter,
    createRotationStreamSupplier,
    createRangeRotation
} from '../src';

class StringStream extends Writable {
    static streamId = 1;

    constructor () {
        super();

        this.string = '';
        this.id = StringStream.streamId++;
    }

    _write (chunk, encoding, callback) {
        this.string += chunk.toString();
        callback();
    }
}

test('should correctly stream', async t => {

    const timestampToStringStub = sinon.stub();
    timestampToStringStub.withArgs(0).returns('zero');
    timestampToStringStub.withArgs(1).returns('one');
    timestampToStringStub.withArgs(2).returns('two');

    const formatter = createToStringFormatter(timestampToStringStub);

    let streams = [
        new StringStream(),
        new StringStream()
    ];

    const streamForEntrySpy = sinon.spy(logEntry => streams[logEntry && logEntry.logTimestamp]);
    
    const rangeRotation = createRangeRotation(1);

    const streamSupplier = createRotationStreamSupplier(streamForEntrySpy, rangeRotation);
    const streamWriter = createStreamWriter(formatter, streamSupplier, ' / ');

    const logEntries = [
        {
            logTimestamp: 0,
            logMessage: 'test message 1',
            logLevel: 'TEST1'
        }, {
            logTimestamp: 0,
            logMessage: 'test message 2',
            logLevel: 'TEST2'
        }, {
            logTimestamp: 1,
            logMessage: 'test message 3',
            logLevel: 'TEST3'
        }
    ];

    streamWriter(logEntries[0]);
    streamWriter(logEntries[1]);
    streamWriter(logEntries[2]);

    streamWriter(null);

    await Promise.all(
        streams.map(stream => new Promise(resolve => stream.end(resolve)))
    );

    t.is(streams[0].string, 'zero TEST1: test message 1 / zero TEST2: test message 2 / ');
    t.is(streams[1].string, 'one TEST3: test message 3 / ');

    t.true(streamForEntrySpy.getCall(0).calledWith(logEntries[0]));
    t.true(streamForEntrySpy.getCall(1).calledWith(logEntries[2]));
    t.true(streamForEntrySpy.getCall(2).calledWith(null));
});

test('should not stream empty log entries', t => {
    const writeSpy = sinon.spy();
    const formatterSpy = sinon.spy();

    const streamSupplier = () => ({write: writeSpy});
    const streamWriter = createStreamWriter(formatterSpy, streamSupplier, 'x');
    streamWriter(null);

    t.true(formatterSpy.notCalled);
    t.true(writeSpy.notCalled);

});
