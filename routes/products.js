const express = require('express');
const router = express();
const multerConfig = require('../multer');
const cloud = require('../cloudinaryconifg');
var cors = require('cors');
const {Category} = require('../models/category');
const {Product} = require('../models/product');
const {Brand} = require('../models/brand');
const {User} = require('../models/user');
const auth = require('../middleware/auth');

router.use(cors());

router.get(`/`, async (req, res) =>{
    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')};
    }
    const productList = await Product.find(filter).populate('category').populate('brand');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
});

router.get('/brands', async (req, res) =>{
    let filter2 = {};
    if(req.query.brands)
    {
         filter2 = {brand: req.query.brands};
    }

    const List = await Product.find(filter2).populate('category').populate('brand')

    if(!List) {
        res.status(500).json({success: false})
    } 
    res.send(List);
});

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category').populate('brand');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
});

router.post('/', multerConfig.any('image') ,async (req,res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const brand = await Brand.findById(req.body.brand);
    if(!brand) return res.status(400).send('Invalid brand');

    const result = await cloud.uploads(req.files[0].path)

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: result.url,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    await product.save();

    res.send(product);
});

router.put('/:id', async (req,res)=> {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true}
    )

    if (!product) return res.status(404).send('The product with the given ID was not found.');

    res.send(product);
});

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
});

router.post('/:id/reviews', auth ,async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const review = {
        name: req.body.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
        const updatedProduct = await product.save();
        res.status(201).send({
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        message: 'Review saved successfully.',
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  });

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
});

module.exports = router;