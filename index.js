const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const users = require('./routes/users');
const products = require('./routes/products');
const categories = require('./routes/categories');
const brands = require('./routes/brands');
const orders = require('./routes/orders');
const app = express();

app.use(cors());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

mongoose.connect(process.env.MONGO_DB,{ useNewUrlParser: true , useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/brands', brands);
app.use('/api/orders', orders);
    
const port = process.env.PORT || 8080;
app.listen(port,()=> console.log(`Listening on port ${port}...`));    