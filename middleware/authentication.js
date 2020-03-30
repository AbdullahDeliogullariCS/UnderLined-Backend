const jwt = require('jsonwebtoken');

// errors
const authenticationError = require('../errors/http-errors');

const secretKey = 'secret_or_private_key';
const tokenExpiration = '1h';

const createToken = (payload) => {
    const token = jwt.sign(
        payload,
        secretKey,
        {expiresIn: tokenExpiration}
    );
    return token;
};

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization 'Bearer Token'
        if(!token) {
            return next(authenticationError.authorizationError('Authentication failed'));
        }
        const decodedToken = jwt.verify(token, secretKey);
        req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        return next(authenticationError.authorizationError('Authentication failed'));
    }
};

exports.createToken = createToken;
exports.verifyToken = verifyToken;


