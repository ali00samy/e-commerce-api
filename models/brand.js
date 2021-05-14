const Joi = require('joi');
const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    }
});

const Brand = mongoose.model('Brand', brandSchema);

exports.Brand = Brand;
exports.brandSchema = brandSchema;