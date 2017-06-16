var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var crypto = require('crypto');
var send = require('./../mail');
var Admin = mongoose.model('Admin');
var auth = require('../auth');



router.get('/admin', auth.optional, function(req, res, next){
  Admin.findById(req.payload.id).then(function(admin){
    if(!admin){ return res.sendStatus(401); }

    return res.json({admin});
  }).catch(next);
});

router.put('/withdraw', auth.required, function(req, res, next){
  Admin.findById(req.payload.id).then(function(admin){
    if(!admin){ return res.sendStatus(401); }
    admin.resetBalance()
    return res.json({admin});
  }).catch(next);
});

router.get('/admins',auth.optional,(req, res) => {
  Admin.find().then((admins)=>{
    res.status(200).json(admins)
  }).catch((err) => {
    res.status(500).json({
      message: err
    })
  });
});


router.put('/admin', auth.required, function(req, res, next){
  Admin.findById(req.payload.id).then(function(admin){
    if(!admin){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.email !== 'undefined'){
      admin.email = req.body.user.email;
    }
    if(typeof req.body.user.password !== 'undefined'){
      admin.setPassword(req.body.user.password);
    }
    if(typeof req.body.user.creditcard !== 'undefined'){
      admin.creditcard = req.body.user.creditcard;
    }

    return admin.save().then(function(){
      return res.json({admin: admin.toAuthJSON()});
    });
  }).catch(next);
});

router.post('/admins/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/admins', function(req, res, next){
  var admin = new Admin();
  const password = crypto.randomBytes(5).toString('hex');
  admin.email = req.body.email;
  admin.setPassword(password);
  admin.save().then(function(){
    send(admin.email,password)
    return res.json({admin});
  }).catch((err) => {
    res.status(400).json({
      message: err
    })
  })
});

router.post('/users', function(req, res, next){
  var admin = new Admin();

  admin.email = req.body.email;
  admin.save().then(function(){
    return res.json({admin: admin});
  }).catch((err) => {
    res.status(400).json({
      message: err
    })
  })
});

router.post('/systemadmin', function(req, res, next){
  var admin = new Admin();
  admin.email = req.body.email;
  admin.setPassword(req.body.password);
  admin.save().then(function(){
    return res.json({admin: admin});
  }).catch((err) => {
    res.status(400).json({
      message: err
    })
  })
});

module.exports = router;
