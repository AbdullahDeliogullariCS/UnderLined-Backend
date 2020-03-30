const express = require('express');
const authentication = require('../middleware/authentication')

// controllers
const chaptersControllers = require('../controllers/chapters-controllers');

// validations
const chaptersValidations = require('../validations/chapters-validations');

const router = express.Router();

// GET routes
router.get('/:cid', chaptersControllers.getChapterById);

router.get('/resource/:cid', chaptersControllers.getChapterByResourceId);

// Authentication
router.use(authentication.verifyToken);

// POST routes
router.post('/', chaptersValidations.createChapterValidation, chaptersControllers.createChapter);

// PATCH routes
router.patch('/:cid', chaptersValidations.updateChapterValidation, chaptersControllers.updateChapter);

// DELETE routes
router.delete('/:cid', chaptersControllers.deleteChapter);

module.exports = router;
