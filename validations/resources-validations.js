const validator = require('express-validator');

// resources validations
const createResourceValidation = [
    validator.check('title').not().isEmpty(),
    validator.check('author').not().isEmpty(),
    validator.check('type').not().isEmpty(),
    validator.check('language').not().isEmpty(),
    validator.check('image').not().isEmpty(),
    validator.check('summary').not().isEmpty(),
    validator.check('creator').not().isEmpty()
];

const updateResourceValidation = [
    validator.check('title').not().isEmpty(),
    validator.check('author').not().isEmpty(),
    validator.check('type').not().isEmpty(),
    validator.check('language').not().isEmpty(),
    validator.check('image').not().isEmpty(),
    validator.check('summary').not().isEmpty(),
    validator.check('creator').not().isEmpty()
];

exports.createResourceValidation = createResourceValidation;
exports.updateResourceValidation = updateResourceValidation;
