
import debug from './debug';

const placeholderToString = placeholder => {
    if (placeholder === null) {
        return '<null>';
    }

    if (placeholder === undefined) {
        return '<undefined>';
    }

    if (placeholder instanceof Error) {
        return placeholder.stack || (placeholder.toString && placeholder.toString());
    }

    if (Array.isArray(placeholder)) {
        if (placeholder.length === 0) {
            return '[]';
        }

        return placeholder.join(', ');
    }

    if (typeof placeholder === 'object') {
        const keys = Object.keys(placeholder);
        if (keys.length === 0) {
            return '-';
        }

        if (keys.length === 1) {
            return placeholderToString(placeholder[keys[0]]);
        }

        return keys
            .map(key => `${key}=${placeholder[key]}`)
            .join(', ')
        ;
    }

    return '' + placeholder;
};

const joinTpl = (tpls, placeholders) => {
    if (typeof tpls === 'string') {
        return tpls;
    }

    if (
        !Array.isArray(tpls)
        || !Array.isArray(placeholders)
        || tpls.length !== placeholders.length + 1
    ) {
        debug('invalid template %o with placeholders %o', tpls, placeholders);
        return '<invalid>';
    }

    let result = tpls[0];

    for (let i = 0; i < placeholders.length; ++i) {
        result += placeholderToString(placeholders[i]) + tpls[i + 1];
    }

    return result;
};

export const createCoalesceTransformer = writeFn => (
    logTimestamp,
    context,
    levelTpls,
    levelPlaceholders,
    msgTpls,
    msgPlaceholders
) => {

    const logLevel = joinTpl(levelTpls, levelPlaceholders);
    const logMessage = joinTpl(msgTpls, msgPlaceholders);

    writeFn({
        logTimestamp,
        logLevel,
        logMessage,
        context
    });
};
