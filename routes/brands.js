const express = require('express');
const {Brand} = require('../models/brand');
const router = express();

router.get('/', async (req, res) =>{
    const brand = await Brand.find();
    res.send(brand);
});

router.get('/:id', async(req,res)=>{
    const brand = await Brand.findById(req.params.id);

    if(!brand) {
        res.status(500).json({message: 'The Brand with the given ID was not found.'})
    } 
    res.status(200).send(brand);
});

router.post('/', async (req,res)=>{
    let brand = new Brand({
        name:req.body.name,
        image:req.body.icon,
    });

    brand = await brand.save();

    res.send(brand);
});

module.exports = router;