var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var ParkingownerSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  parkings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }],
  balance:{ type: Number, default: 0 },
  share:{ type: Number, default: 0 },
  isadmin:{ type: Boolean, default: false },
  hash: String,
  salt: String,
  creditcard: { type: Object, default: {number:'',name:'',expiry:'',cvc:''} },
}, {timestamps: true});

ParkingownerSchema.plugin(uniqueValidator, {message: 'is already taken.'});

ParkingownerSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

ParkingownerSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

ParkingownerSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

ParkingownerSchema.methods.toAuthJSON = function(){
  return {
    email: this.email,
    token: this.generateJWT(),
    balance: this.balance,
    creditcard: this.creditcard,
  };
};

ParkingownerSchema.methods.toProfileJSONFor = function(admin){
  return {
    email: this.email,
    balance: this.balance,
    creditcard: this.creditcard,
  };
};

ParkingownerSchema.methods.addBalance = function(amount){
  this.balance += amount;
  return this.save();
};

ParkingownerSchema.methods.resetBalance = function(amount){
  this.balance = 0;
  return this.save();
};


mongoose.model('Admin', ParkingownerSchema);
