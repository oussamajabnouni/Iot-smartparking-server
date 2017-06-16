var mongoose = require('mongoose');


var ReservationSchema = new mongoose.Schema({
  price: Number,
  period: Number,
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }
}, {timestamps: true});



ReservationSchema.methods.toJSONFor = function(user){
  return {
    parking: this.parking,
    amount: this.amount
  };
};

mongoose.model('Reservation', ReservationSchema);
