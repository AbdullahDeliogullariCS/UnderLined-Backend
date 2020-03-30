const mongoose = require('mongoose');
const validator = require('express-validator');

// models
const Chapter = require('../models/chapter');
const Resource = require('../models/resource');

// errors
const chapterControllersErrors = require('../errors/http-errors');

// GET controllers
const getChapterById = async (req, res, next) => {

    // route parameters
    const chapterId = req.params.cid;

    let chapter;
    try {
        // Fetch chapter from database
        chapter = await Chapter.findById(chapterId);
    } catch (err) {
        // internal server error
        chapterControllersErrors.internalServerError('Fetching chapter from database has been failed');
    }

    if(!chapter) {
        // not found chapter error
        chapterControllersErrors.notFoundError('Could not find a chapter for the provided id');
    }

    // Send response to frontend
    await res.status(200).json({chapter: chapter.toObject({getters: true})});
};

const getChaptersByResourceId = async (req, res, next) => {

    // route parameters
    const resourceId = req.params.rid;

    let resourceWithChapters;
    try {
        // Fetch chapters from database
        resourceWithChapters = await Resource.findById(resourceId)
            .populate({path: 'chapters', model: 'Chapter'});
    } catch (err) {
        // internal server error
        return next(chapterControllersErrors.internalServerError('Fetching chapters has been failed'));
    }

    if(!resourceWithChapters || resourceWithChapters.length === 0){
        // not found resource error
        return next(chapterControllersErrors.notFoundError('Could not find a resource for provided id'));
    }

    // Send response to frontend
    await res.status(200).json({chapters: resourceWithChapters.chapters.map(chapter => chapter.toObject({getters: true}))});
};

// POST controllers
const createChapter = async (req, res, next) => {

    // validation check
    const validationError = validator.validationResult(req);
    if (!validationError.isEmpty()) {
        // unprocessable entity error
        return next(chapterControllersErrors.unprocessableEntityError('Invalid input has been passed'));
    }

    // Get chapter information from frontend
    const {subtitle, text, source} = req.body;

    const createdChapter = new Chapter({
        subtitle,
        text,
        source
    });

    let resource;
    try {
        // Find source of chapter
        resource = await Resource.findById(source);
    } catch (err) {
        return next(chapterControllersErrors.internalServerError('Finding source of particular chapter has been failed'));
    }

    if (!resource) {
        // not found resource error
        return next(chapterControllersErrors.notFoundError('Could not find resource for provided id'));
    }

    // Save changes
    let session;
    try {
        // execute multiple operations in isolation
        session = await mongoose.startSession();
        session.startTransaction();
        await createdChapter.save({session: session});
        resource.chapters.push(createdChapter);
        await resource.save({session: session});
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        return next(chapterControllersErrors.internalServerError('Saving changes has been failed'));
    }

    // Send response to frontend
    res.status(201).json({chapter: createdChapter.toObject({getters: true})});
};

// PATCH controllers
const updateChapter = async (req, res, next) => {

    // validation check
    const validationError = validator.validationResult(req);
    if (!validationError.isEmpty()) {
        // unprocessable entity error
        return next(chapterControllersErrors.unprocessableEntityError('Invalid input has been passed'));
    }

    // route parameters
    const chapterId = req.params.cid;

    // Get chapter information from frontend
    const {subtitle, text} = req.body;

    let chapter;
    try {
        // Fetch chapter from database
        chapter = await Chapter.findById(chapterId);
    } catch (err) {
        // internal server error
        return next(chapterControllersErrors.internalServerError('Fetching chapter from database has been failed'));
    }

    // Make changes on chapter
    chapter.subtitle = subtitle;
    chapter.text = text;

    try {
        // Save modified chapter to database
        await chapter.save();
    } catch (err) {
        // internal server error
        return next(chapterControllersErrors.internalServerError('Modified chapter can not be saved'));
    }

    // Send response to frontend
    res.status(200).json({chapter: chapter.toObject({getters: true})});
};

const deleteChapter = async (req, res, next) => {

    // route parameters
    const chapterId = req.params.cid;

    let chapter;
    try{
        // Fetch chapter from database
        chapter = await Chapter.findById(chapterId)
            .populate({path: 'source', model: 'Resource'});
    } catch (err) {
        // internal server error
        return next(chapterControllersErrors.internalServerError('Fetching chapter from database has been failed'));
    }

    if (!chapter) {
        // not found resource error
        return next(chapterControllersErrors.notFoundError('Could not find a chapter for provided id'));
    }

    // Delete chapter
    let session;
    try {
        // execute multiple operations in isolation
        session = await mongoose.startSession();
        session.startTransaction();
        await chapter.remove({ session: session });
        chapter.source.chapters.pull(chapter);
        await chapter.source.save({ session: session});
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        // internal server error
        return next(chapterControllersErrors.internalServerError('Deleting chapter has been failed'));
    }

    // Send message to frontend
    res.status(200).json({message: 'Deleted chapter'});
};

exports.getChapterById = getChapterById;
exports.getChapterByResourceId = getChaptersByResourceId;
exports.createChapter = createChapter;
exports.updateChapter= updateChapter;
exports.deleteChapter = deleteChapter;
