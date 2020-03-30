const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const resourceSchema = new Schema({
    title: {type: String, required: true, unique: true},
    author: {type: String, required: true},
    type: {type: String, required: true},
    language: {type: String, required: true},
    image: {type: String, required: true},
    summary: {type: String, required: true},
    likedBy: [{type: mongoose.Types.ObjectId, required: false, ref: 'User'}],
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    chapters: [{type: mongoose.Types.ObjectId, required: false, ref: 'Chapter'}]
});

resourceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Resource', resourceSchema);
