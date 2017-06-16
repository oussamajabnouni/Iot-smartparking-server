var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('../auth');


//Get all and add reservation
router.get('/',auth.optional,(req, res) => {
        User.find({email:req.body.email}).then((user)=>{
          res.status(200).json(user)
        }).catch((err) => {
          res.status(500).json({
            message: err
          })
        });
});

router.put('/', function(req, res, next){
  User.find({email:req.body.email}).then(function(user){
    if(!user){ return res.sendStatus(401); }
    user = req.body
    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});



module.exports = router;