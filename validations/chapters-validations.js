const validator = require('express-validator');

// resources validations
const createChapterValidation = [
    validator.check('subtitle').not().isEmpty(),
    validator.check('text').not().isEmpty(),
    validator.check('source').not().isEmpty()
];

const updateChapterValidation = [
    validator.check('subtitle').not().isEmpty(),
    validator.check('text').not().isEmpty()
];

exports.createChapterValidation = createChapterValidation;
exports.updateChapterValidation = updateChapterValidation;
