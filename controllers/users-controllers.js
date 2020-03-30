const validator = require('express-validator');
const bcrypt = require('bcryptjs');
const authentication = require('../middleware/authentication');

// models
const User = require('../models/user');

// errors
const userControllersError = require('../errors/http-errors');

// GET controllers
const getUserById = async (req, res, next) => {

    // route parameters
    const userId = req.params.uid;

    let user;
    try {

        // Fetch user from database
        user = await User.findById(userId)
            .populate({path: 'resources', model: 'Resource'})
            .populate({path: 'favorites', model: 'Resource'})
            .select(['-password']);

    } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Fetching user from database has been failed'));
    }

    // Send response to frontend
    await res.status(200).json({user: user.toObject({getters: true})});
};

// POST controllers
const signUp = async (req, res, next) => {

    // validation check
    const validationError = validator.validationResult(req);
    if (!validationError.isEmpty()) {
        // unprocessable entity error
        return next(userControllersError.unprocessableEntityError('Invalid input has been passed'));
    }

    // Get user information from frontend
    const {name, surname, email, username, password, role,  photo, favorites, resources} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Signing up has been failed'));
    }

    if(existingUser){
        // unprocessable entity error
        return next(userControllersError.unprocessableEntityError('User exists already'));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password,12);
    } catch (err) {
        return next(userControllersError.internalServerError('Hashing process has been failed'));
    }

    const createdUser = new User({
        name,
        surname,
        email,
        username,
        password: hashedPassword,
        role,
        photo,
        favorites,
        resources
    });

    try {
        await createdUser.save();
    } catch (e) {
        // internal server error
        return next(userControllersError.internalServerError('SignUp process has been failed'));
    }

    // Create Token
    let token;
    token = authentication.createToken({userId: createdUser.id, email: createdUser.email});

    // Send response to frontend with token
    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
};

const signIn = async (req, res, next) => {

    // Get user information from frontend
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (e) {
        // internal server error
        return next(userControllersError.internalServerError('SignIn process has been failed'));
    }

    if(!existingUser){
        return next(userControllersError.authorizationError('Could not identify user, credentials seem to be wrong'));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (e) {
        return next(userControllersError.internalServerError('SignIn process has been failed'));
    }

    if(!isValidPassword){
        return next(userControllersError.authorizationError('Wrong password has been entered'));
    }

    // Create Token
    let token;
    token = authentication.createToken({userId: existingUser.id, email: existingUser.email});

    // Send response to frontend with token
    res.status(202).json({userId: existingUser.id, email: existingUser.email, token: token});
};

// PATCH controllers
const updateUser = async (req, res, next) => {

    // route parameters
    const userId = req.params.uid;

    // Get resource information from frontend
    const { name, surname, email, username, photo } = req.body;

    let user;
    try {
        // Fetch user from database
        user = await User.findById(userId);
    } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Fetching user from database has been failed'));
    }

    // Make changes on user
    user.name = name;
    user.surname = surname;
    user.email = email;
    user.username = username;
    user.photo = photo;

    try {
        // Save modified user to database
        await user.save();
    } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Modified user can not be saved'));
    }

    // Send response to frontend
    res.status(200).json({user: user.toObject({getters: true})});
};

// DELETE controllers
const deleteUser = async (req, res, next) => {

    // route parameters
    const userId = req.params.uid;

    let user;
    try {
        // Find user from database
        user = await User.findById(userId).populate(
            {
                path: 'resources',
                model: 'Resource',
                select: 'title',
                populate: {
                    path: 'chapters',
                    model: 'Chapter'
                }
            });
    } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Finding user in database has been failed'));
    }

    if (!user) {
        // not found user error
        return next(userControllersError.notFoundError('Could not find user for provided id'));
    }

    // Delete user
    try {
        await user.remove();
        user.resources.map(async (resource) => {
            await resource.remove();
            resource.chapters.map(async (chapter) => {
                await chapter.remove();
            });
        });
        } catch (err) {
        // internal server error
        return next(userControllersError.internalServerError('Deleting resource has been failed'));
    }

    // Send message to frontend
    res.status(200).json({ message: 'Deleted user'});
};

exports.signUp = signUp;
exports.signIn = signIn;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
