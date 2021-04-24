const Joi = require('joi');
const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const {User} = require('../models/user');
const router = express.Router();

router.get('/', async (req, res)=> {
  const user = await User.find().select({name: 1, email :1});
  res.send(user);
})

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcryptjs.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 