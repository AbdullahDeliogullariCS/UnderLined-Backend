const mongoose = require('mongoose');
const validator = require('express-validator');

// models
const Resource = require('../models/resource');
const User = require('../models/user');

// errors
const resourceControllersErrors = require('../errors/http-errors');

// GET controllers
const getResourceById = async (req, res, next) => {

    // route parameters
    const resourceId = req.params.rid;

    let resource;
    try {

        // Fetch resource from database
        resource = await Resource.findById(resourceId)
            .populate({path: 'chapters', model: 'Chapter'});

    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching resource from database has been failed'));
    }

    if(!resource) {
        // not found resource error
        return next(resourceControllersErrors.notFoundError('Could not find a resource for the provided id'));
    }

    // Send response to frontend
    await res.status(200).json({resource: resource.toObject({getters: true})});
};

const getResourcesByUserId = async (req, res, next) => {

    // route parameters
    const userId = req.params.uid;

    let userWithResources;
    try {
        // Fetch resources from database
        userWithResources = await User.findById(userId)
            .populate({path: 'resources', model: 'Resource'});
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching resources from database has been failed'));
    }

    if(!userWithResources || userWithResources.length === 0) {
        // not found resource error
        return next(resourceControllersErrors.notFoundError('Could not find resources for the provided user id'));
    }

    // Send response to frontend
    await res.status(200).json({resources: userWithResources.resources.map(resource => resource.toObject({getters: true}))});
};

const getResourcesByTitle = async (req, res, next) => {

    // route parameters
    const resourceTitle = req.params.rtitle;

    let resources;
    try {
        // Fetch resources from database
        resources = await Resource.find({title: resourceTitle});
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching resources from database has been failed'));
    }

    if(!resources) {
        // not found resource error
        return next(resourceControllersErrors.notFoundError('Could not find a resource for the provided title'));
    }

    // Send response to frontend
    await res.status(200).json({resources: resources.map(resource => resource.toObject({getters: true}))});
};

// POST controllers
const createResource = async (req, res, next) => {

    // validation check
    const validationError = validator.validationResult(req);
    if (!validationError.isEmpty()) {
        // unprocessable entity error
        return next(resourceControllersErrors.unprocessableEntityError('Invalid input has been passed'));
    }

    // Get resource information from frontend
    const { title, author, type, language, image, summary, likedBy, creator, chapters } = req.body;

    const createdResource = new Resource({
        title,
        author,
        type,
        language,
        image,
        summary,
        likedBy,
        creator,
        chapters
    });

    let user;
    try {
        // Find creator of resource
        user = await User.findById(creator);
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Finding creator of particular resource has been failed'));
    }

    if(!user) {
        // not found user error
        return next(resourceControllersErrors.notFoundError('Could not find user for provided id'));
    }

    // Save changes
    let session;
    try {
        // execute multiple operations in isolation
        session = await mongoose.startSession();
        session.startTransaction();
        await createdResource.save({session: session});
        user.resources.push(createdResource);
        await user.save({session: session});
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        // internal server error
        return next(resourceControllersErrors.internalServerError('Saving changes has been failed'));
    }

    // Send response to frontend
    res.status(201).json({resource: createdResource.toObject({getters: true})});
};

// PATCH controllers
const updateResource = async (req, res, next) => {

    // validation check
    const validationError = validator.validationResult(req);
    if(!validationError.isEmpty()) {
        // unprocessable entity error
        resourceControllersErrors.unprocessableEntityError('Invalid input has been passed');
    }

    // route parameters
    const resourceId = req.params.rid;

    // Get resource information from frontend
    const { title, author, type, language, image, summary } = req.body;

    let resource;
    try {
        // Fetch resource from database
        resource = await Resource.findById(resourceId);
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching resources from database has been failed'));
    }

    // Make changes on resource
    resource.title = title;
    resource.author = author;
    resource.type = type;
    resource.language = language;
    resource.image = image;
    resource.summary = summary;

    try {
        // Save modified resource to database
        await resource.save();
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Modified resource can not be saved'));
    }

    // Send response to frontend
    res.status(200).json({resource: resource.toObject({getters: true})});
};

const addResourceToFavorites = async (req, res, next) => {

    // route parameters
    const resourceId = req.params.rid;
    const userId = req.params.uid;

    let resource;
    try {
        // Fetch resource from database
        resource = await Resource.findById(resourceId);
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching resources from database has been failed'));
    }

    if(!resource) {
        // not found user error
        return next(resourceControllersErrors.notFoundError('Could not find resource for provided id'));
    }

    let user;
    try {
        // Find creator of resource
        user = await User.findById(userId);
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Fetching user from database has been failed'));
    }

    if(!user) {
        // not found user error
        return next(resourceControllersErrors.notFoundError('Could not find user for provided id'));
    }

    // Save changes
    let session;
    try {
        // execute multiple operations in isolation
        session = await mongoose.startSession();
        session.startTransaction();
        user.favorites.push(resource);
        resource.likedBy.push(user);
        await user.save({session: session});
        await resource.save({session: session});
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        // internal server error
        return next(resourceControllersErrors.internalServerError('Saving changes has been failed'));
    }

    // Send response to frontend
    res.status(200).json({resource: resource.toObject({getters: true})});
};

// DELETE controllers
const deleteResource = async (req, res, next) => {

    // route parameters
    const resourceId = req.params.rid;

    let resource;
    try {
        // Find resource from database
        resource = await Resource.findById(resourceId)
            .populate({path: 'creator', model: 'User'});
    } catch (err) {
        // internal server error
        return next(resourceControllersErrors.internalServerError('Finding resource in database has been failed'));
    }

    if (!resource) {
        // not found resource error
        return next(resourceControllersErrors.notFoundError('Could not find resource for provided id'));
    }

    // Delete resource
    let session;
    try {
        // execute multiple operations in isolation
        session = await mongoose.startSession();
        session.startTransaction();
        await resource.remove({ session: session});
        resource.creator.resources.pull(resource);
        await resource.creator.save({ session: session });
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        // internal server error
        return next(resourceControllersErrors.internalServerError('Deleting resource has been failed'));
    }

    // Send message to frontend
    res.status(200).json({ message: 'Deleted resource' });
};

exports.getResourceById = getResourceById;
exports.getResourcesByUserId = getResourcesByUserId;
exports.getResourcesByTitle = getResourcesByTitle;
exports.createResource = createResource;
exports.updateResource = updateResource;
exports.addResourceToFavorites = addResourceToFavorites;
exports.deleteResource = deleteResource;
