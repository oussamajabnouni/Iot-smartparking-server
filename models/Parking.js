var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Admin = mongoose.model('Admin');

var ParkingSchema = new mongoose.Schema({
  title: String,
  description: String,
  reserved: { type: Number, default: 0 },
  capacity: String,
  location: Object,
  hourprice:String,
  dayprice:String,
  deviceid:String,
  rating: { type: Number, default: 0 },
  imageurl:String,
  amenities: { type : Array , "default" : [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {timestamps: true});

ParkingSchema.plugin(uniqueValidator, {message: 'is already taken'});

ParkingSchema.methods.updateLots = function(amount) {
  var parking = this;
  parking.reserved += amount ;
  if (parking.reserved >= 0 && parking.reserved <= parking.capacity){
        return parking.save();
  }
};

ParkingSchema.methods.toJSONFor = function(admin){
  return {
    title: this.title,
    reserved: this.reserved,
    capacity: this.capacity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    owner: this.author.toProfileJSONFor(admin)
  };
};

mongoose.model('Parking', ParkingSchema);
