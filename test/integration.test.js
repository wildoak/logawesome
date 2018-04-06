import {test} from 'ava';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {promisify} from 'util';
import rimraf from 'rimraf';

import {
    LogSystem,
    createJsonFormatter,
    createRangeRotation,
    createRotationStreamSupplier,
    createStreamWriter,
    createStreamForEntrySupplier,
    createSeparateTransformer
} from '../src';

const mkdtempAsync = promisify(fs.mkdtemp);
const readFileAsync = promisify(fs.readFile);
const rimrafAsync = promisify(rimraf);

test.beforeEach(async t => {
    t.context.tmpdir = await mkdtempAsync(path.join(os.tmpdir(), 'logawesome-'));
});

test.afterEach(async t => {
    await rimrafAsync(t.context.tmpdir);
});

test('should log to files with rotation', async t => {

    let i = 0;
    const logSystem = new LogSystem(() => i++);

    const timestampToString = ts => `TS:${ts}`;
    const formatter = createJsonFormatter(timestampToString);

    const streamForEntry = createStreamForEntrySupplier(timestamp => {
        return path.join(t.context.tmpdir, `${timestamp}.log`);
    });
    
    const shouldStreamRotate = createRangeRotation(2);
    const streamSupplier = createRotationStreamSupplier(
        streamForEntry,
        shouldStreamRotate
    );

    const entrySeparator = '\n';

    const streamWriter = createStreamWriter(
        formatter,
        streamSupplier,
        entrySeparator
    );

    const separateTransformer = createSeparateTransformer(streamWriter);

    logSystem.addAppender(separateTransformer);

    const logger = logSystem.createLogger({a: 'b'});
    logger `DEBUG` `a${{b: 'c'}}d${{e: 'f'}}`;
    logger `INFO` `g${{h: 'i'}}j${{k: 'l'}}`;
    logger `WARN` `m${{n: 'o'}}p${{q: 'r'}}`;
    logger `ERROR` `s${{t: 'u'}}v${{w: 'x'}}`;
    logger `DEBUG` `y${{z: '0'}}1${{2: 3}}`;
    logger `INFO` `4${{5: 6}}7${{8: 9}}`;

    // wait for all logs
    await new Promise(resolve => process.nextTick(resolve));

    // wait for close
    await promisify(streamForEntry.close.bind(streamForEntry))();

    // already closed
    await new Promise(resolve => streamForEntry.close(resolve));

    // already closed
    logger `ERROR` `should not log`;

    const [l0, l2, l4] = await Promise.all(
        ['0.log', '2.log', '4.log']
            .map(filename => readFileAsync(path.join(t.context.tmpdir, filename)))
            .map(p => p
                .then( // promise with content
                    c => c
                        .toString() // buffer to string
                        .split('\n') // split new line
                        .filter(text => text) // filter empty lines
                        .map(JSON.parse) // to json
                )
            )
    );

    t.deepEqual(l0, [
        {logTimestamp: 'TS:0', logLevel: 'DEBUG', logMessage: 'a${b}d${e}', context: {a: 'b', b: 'c', e: 'f'}},
        {logTimestamp: 'TS:1', logLevel: 'INFO', logMessage: 'g${h}j${k}', context: {a: 'b', h: 'i', k: 'l'}}
    ]);

    t.deepEqual(l2, [
        {logTimestamp: 'TS:2', logLevel: 'WARN', logMessage: 'm${n}p${q}', context: {a: 'b', n: 'o', q: 'r'}},
        {logTimestamp: 'TS:3', logLevel: 'ERROR', logMessage: 's${t}v${w}', context: {a: 'b', t: 'u', w: 'x'}}
    ]);

    t.deepEqual(l4, [
        {logTimestamp: 'TS:4', logLevel: 'DEBUG', logMessage: 'y${z}1${2}', context: {2: 3, a: 'b', z: '0'}},
        {logTimestamp: 'TS:5', logLevel: 'INFO', logMessage: '4${5}7${8}', context: {5: 6, 8: 9, a: 'b'}}
    ]);

    t.pass();
});

