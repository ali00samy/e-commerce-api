const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const Joi = require('joi');
const {User,validateUser} = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.get('/', async (req, res) => {
    const user = await User.find().select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User({
    name : req.body.name,
    email : req.body.email,
    password : req.body.password,
    phone : req.body.phone,
    gendre : req.body.gendre
  });
  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.post('/login', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');
  
    const validPassword = await bcryptjs.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');
  
    const token = user.generateAuthToken();
    res.send(token);
});

router.put('/:id', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcryptjs.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        password: newPassword,
        phone: req.body.phone,
        gendre: req.body.gendre
      },
      { new: true}
  )

  if (!user) return res.status(404).send('The user with the given ID was not found.');

  res.send(_.pick(user,['name','email','phone']));
})

router.delete('/:id', (req, res)=>{
  User.findByIdAndRemove(req.params.id).then(user =>{
      if(user) {
          return res.status(200).json({success: true, message: 'the user is deleted!'})
      } else {
          return res.status(404).json({success: false , message: "user not found!"})
      }
  }).catch(err=>{
     return res.status(500).json({success: false, error: err}) 
  })
})

function validate(req) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required()
    };
  
    return Joi.validate(req, schema);
};

module.exports = router;