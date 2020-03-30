const express = require('express');
const authentication = require('../middleware/authentication');

// controllers
const resourcesControllers = require('../controllers/resources-controllers');

// validations
const resourcesValidations = require('../validations/resources-validations');

const router = express.Router();

// GET routes
router.get('/:rid', resourcesControllers.getResourceById);

router.get('/user/:uid', resourcesControllers.getResourcesByUserId);

router.get('/search/:rtitle', resourcesControllers.getResourcesByTitle);

// Authentication
router.use(authentication.verifyToken);

// POST routes
router.post('/', resourcesValidations.createResourceValidation, resourcesControllers.createResource);

// PATCH routes
router.patch('/:rid', resourcesValidations.updateResourceValidation, resourcesControllers.updateResource);

router.patch('/:rid/users/:uid', resourcesControllers.addResourceToFavorites);

// DELETE routes
router.delete('/:rid', resourcesControllers.deleteResource);

module.exports = router;
