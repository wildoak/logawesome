export const createExpressMiddleware = createLogger => (req, resp, next) => {

    req.logger = createLogger();

    const method = req.method;
    const path = req.path;
    req.logger `INFO` `Request:  ${{method}} ${{path}}`;

    resp.once('finish', () => {
        
        const statusCode = resp.statusCode;
        const statusMessage = resp.statusMessage;

        req.logger `INFO` `Response: ${{method}} ${{path}} => ${{statusCode}} ${{statusMessage}}`;
    });

    next();
};
