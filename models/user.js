const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 6},
    role: {type: String, required: true},
    photo: {type: String, required: false},
    favorites: [{type: mongoose.Types.ObjectId, required: false, ref: 'Resource'}],
    resources: [{type: mongoose.Types.ObjectId, required: false, ref: 'Resource'}]
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
