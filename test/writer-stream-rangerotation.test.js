import {test} from 'ava';
import {createRangeRotation} from '../src';

test('should only accept numbers as millis', t => {
    t.throws(() => createRangeRotation('invalid'));
});
