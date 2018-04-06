import debug from './debug';

const joinSeparatContextTpl = (mutableContext, placeholderPrefix, tpls, placeholders) => {
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

    let nextPlaceholderId = 1;

    let string = tpls[0];
    for (let i = 0; i < placeholders.length; ++i) {
        const text = tpls[i + 1];
        let placeholder = placeholders[i];

        while (placeholder instanceof Function) {
            placeholder = placeholder();
        }

        if (
            placeholder === undefined
            || placeholder === null
            || typeof placeholder === 'string'
            || typeof placeholder === 'number'
            || Array.isArray(placeholder)
        ) {
            const id = nextPlaceholderId++;
            const placeholderName = `_${placeholderPrefix}${id}`;
            mutableContext[placeholderName] = placeholder;
            string += `\${${placeholderName}}`;
        } else if (typeof placeholder === 'object') {
            
            Object.keys(placeholder).forEach((key, j) => {
                const value = placeholder[key];
                let placeholderName = key;

                // find placeholder: if placeholderName exists, then value have to match,
                // else next placeholderName is tested
                let id = 2;
                while (
                    placeholderName in mutableContext
                    && mutableContext[placeholderName] !== value
                ) {
                    placeholderName = `${key}${id++}`;
                }

                mutableContext[placeholderName] = value;
                
                if (j !== 0) {
                    string += ', ';
                }

                string += `\${${placeholderName}}`;
            });
        } else {
            debug('invalid placeholder %o', placeholder);
            string += '<invalid>';
        }

        string += text;

    }

    return string;
};

export const createSeparateTransformer = writeFn => (
    logTimestamp,
    context,
    levelTpls,
    levelPlaceholders,
    msgTpls,
    msgPlaceholders
) => {
    const newContext = {...context};
    const logLevel = joinSeparatContextTpl(newContext, 'level', levelTpls, levelPlaceholders);
    const logMessage = joinSeparatContextTpl(newContext, 'message', msgTpls, msgPlaceholders);

    writeFn({
        logTimestamp,
        logLevel,
        logMessage,
        context: newContext
    });
};
