class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); // message property
        this.code = errorCode; // code property
    }
};

const notFoundError = (message) => {
    return new HttpError(message,404);
};

const unprocessableEntityError = (message) => {
    return new HttpError(message,422);
};

const internalServerError = (message) => {
    return new HttpError(message,500);
};

const authorizationError = (message) => {
    return new HttpError(message, 401);
};

const forbiddenError = (message) => {
    return new HttpError(message, 403);
};

exports.notFoundError = notFoundError;
exports.unprocessableEntityError = unprocessableEntityError;
exports.internalServerError = internalServerError;
exports.authorizationError = authorizationError;
exports.forbiddenError = forbiddenError;
