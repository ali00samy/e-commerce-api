const express = require('express');
const { Category, validate} = require('../models/category');
const router = express();

router.use(cors());

router.get('/', async (req, res) =>{
    const categories = await Category.find();
    res.send(categories);
});

router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
});

router.post('/', async (req,res)=>{
    let category = new Category({
        name:req.body.name,
        image:req.body.icon,
    });

    category = await category.save();

    res.send(category);
});

module.exports = router;