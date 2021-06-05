const {Order,validateOrder} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {Product} = require('../models/product');
const auth = require('../middleware/auth');
var cors = require('cors');
const router = express.Router();

router.use(cors());

router.get("/", async (req, res) => {
    const orders = await Order.find({}).populate('user');
    res.send(orders);
  });

router.get("/mine", auth ,async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('user').populate({path:'orderItems',populate:{
        path: 'product',populate:'category',populate:'brand'
    }});
    res.send(orders);
});

router.get("/:id", async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id })
    .populate('user')
    .populate({path:'orderItems',populate:{
        path: 'product',populate:'category',populate:'brand'
    }});
    if (order) {
      res.send(order);
    } else {
      res.status(404).send("Order Not Found.")
    }
  });

router.post('/',async (req,res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;        
    }))
    const orderItemsIdsResolved =  await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product');
        const product = await Product.findById(orderItem.product.id)

        const totalPrice = orderItem.product.price * orderItem.quantity;

        if(product.countInStock===0) return res.status(400).send('product in not in stock');
        product.countInStock= product.countInStock-orderItem.quantity;

        await product.save();
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        user: req.body.user,
    })

    order = await order.save();

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})


router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: "accepting"
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})

router.delete("/:id", async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id });
    if (order) {
      const deletedOrder = await order.remove();
      res.send(deletedOrder);
    } else {
      res.status(404).send("Order Not Found.")
    }
});

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

module.exports =router;