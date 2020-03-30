const express = require('express');
const validator = require('express-validator');
const authentication = require('../middleware/authentication');

// controllers
const usersControllers = require('../controllers/users-controllers');

// validations
const usersValidations = require('../validations/users-validations');

const router = express.Router();

router.get('/signin', usersValidations.signInValidation, usersControllers.signIn);

router.post('/signup', usersValidations.signUpValidation, usersControllers.signUp);

// Authentication
router.use(authentication.verifyToken);

router.get('/:uid', usersControllers.getUserById);

router.patch('/:uid', usersValidations.updateUserValidation, usersControllers.updateUser);

router.delete('/:uid', usersControllers.deleteUser);



module.exports = router;
