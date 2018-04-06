import {EventEmitter} from 'events';
import {test} from 'ava';
import sinon from 'sinon';
import {LogSystem, createExpressMiddleware} from '../src';

const tick = async () => await new Promise(resolve => process.nextTick(resolve));

test.beforeEach(t => {
    const appenderSpy = sinon.spy();

    let i = 0;
    const logSystem = new LogSystem(() => i++);
    logSystem.addAppender(appenderSpy);

    let uuid = 0;

    const createLogger = () => {
        const logger = logSystem.createLogger({
            coId: `reqID:${uuid++}`
        });

        return logger;
    };
    const mw = createExpressMiddleware(createLogger);

    t.context = {
        logSystem,
        appenderSpy,
        mw
    };
});

test('should create req.logger, log request and resp on finish', async t => {
    const {appenderSpy, mw} = t.context;

    const req = {
        method: 'POST',
        path: '/api/test'
    };

    const next = sinon.spy();
    const resp = new EventEmitter();
    mw(req, resp, next);

    t.true('logger' in req);
    await tick();

    t.true(appenderSpy.calledOnceWith(
        0,
        {
            coId: 'reqID:0'
        },
        ['INFO'], [],
        ['Request:  ', ' ', ''], [{method: 'POST'}, {path: '/api/test'}]
    ));

    appenderSpy.resetHistory();

    resp.statusCode = 111;
    resp.statusMessage = 'Test';
    resp.emit('finish');

    await tick();
    t.true(appenderSpy.calledOnceWith(
        1,
        {
            coId: 'reqID:0'
        },
        ['INFO'], [],
        ['Response: ', ' ', ' => ', ' ', ''], [{method: 'POST'}, {path: '/api/test'}, {statusCode: 111}, {statusMessage: 'Test'}]
    ));
});
