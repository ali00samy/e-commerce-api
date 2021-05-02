const Joi = require('joi');
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
});

const Category = mongoose.model('Category', categorySchema);

exports.Category = Category;
exports.categorySchema = categorySchema;