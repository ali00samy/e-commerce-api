const express = require('express');
const { Category, validate} = require('../models/category');
const router = express();

router.get('/', async (req, res) =>{
    const categories = await Category.find();
    res.send(categories);
});

router.post('/', async (req,res)=>{
    let category = new Category({
        name:req.body.name,
        icon:req.body.icon,
    });

    category = await category.save();
    
    res.send(category);
});