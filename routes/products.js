const express = require('express');
const router = express();
const {Category} = require('../models/category');
const {Product} = require('../models/product')

router.get('/', async (req,res) =>{
    const products = await Product.find().sort('name');
    res.send(products);
});

router.post('/', async (req,res) =>{
    const category = await Category.findById(req.body.categoryId);
    if (!category) return res.status(400).send('invalid category');

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: {
            _id: category._id,
        },
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    await product.save();

    res.send(product);
});

module.exports = router;