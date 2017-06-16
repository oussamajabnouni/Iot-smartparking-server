var mongoose = require('mongoose');


var UserSchema = new mongoose.Schema({
  email: String,
  paypal: Object,
  creditcards: { type : Array , "default" : [] },
}, {timestamps: true});

mongoose.model('User', UserSchema);
