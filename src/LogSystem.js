import debug from './debug';

export default class LogSystem {
    constructor (timestampProvider = () => Date.now()) {
        this._timestampProvider = timestampProvider;
        this._appenders = [];
    }

    addAppender (appender) {
        this._appenders.push(appender);
    }

    removeAppender (appender) {
        const index = this._appenders.findIndex(a => a === appender);
        if (index === -1) {
            debug('could not remove appender. not found');
            return;
        }

        this._appenders.splice(index, 1);
    }

    createLogger (context = {}) {

        const logFn = (levelTpls, ...levelPlaceholders) => (msgTpls, ...msgPlaceholders) => {
            const timestamp = this._timestampProvider();
            this.log(timestamp, context, levelTpls, levelPlaceholders, msgTpls, msgPlaceholders);
        };

        logFn.set = (...args) => {

            if (args.length === 1 && typeof args[0] === 'object') {
                for (const k in args[0]) {
                    context[k] = args[0][k];
                }
                return;
            }
            
            if (args.length === 2 && typeof args[0] === 'string') {
                context[args[0]] = args[1];
                return;
            }

            debug('unknown calling convention: %o', args);
        };

        logFn.branch = () => {
            debug('branching logger: %o', context);
            return this.createLogger({...context});
        };

        return logFn;
    }

    log (...args) {
        process.nextTick(() => {
            for (const appender of this._appenders) {
                appender(...args);
            }
        });
    }
}
