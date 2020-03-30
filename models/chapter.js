const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const chapterSchema = new Schema({
    subtitle: {type: String, required: true},
    text: {type: String, required: true},
    source: {type: mongoose.Types.ObjectId, required: true, ref: 'Resource'}
});

chapterSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Chapter', chapterSchema);
