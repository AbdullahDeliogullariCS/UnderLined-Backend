const validator = require('express-validator');

// resources validations
const signUpValidation = [
    validator.check('name').not().isEmpty(),
    validator.check('surname').not().isEmpty(),
    validator.check('email').normalizeEmail().isEmail(),
    validator.check('username').not().isEmpty(),
    validator.check('password').isLength({ min: 6 }),
    validator.check('role').not().isEmpty(),
];

const singInValidation = [
    validator.check('email').normalizeEmail().isEmail(),
    validator.check('password').isLength({ min: 6 }),
];

const updateUserValidation = [
    validator.check('name').not().isEmpty(),
    validator.check('surname').not().isEmpty(),
    validator.check('email').normalizeEmail().isEmail(),
    validator.check('username').not().isEmpty()
];

exports.signUpValidation = signUpValidation;
exports.signInValidation = singInValidation;
exports.updateUserValidation = updateUserValidation;
