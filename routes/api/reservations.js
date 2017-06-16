var router = require('express').Router();
var mongoose = require('mongoose');
var Reservation = mongoose.model('Reservation');
var Parking = mongoose.model('Parking');
var Admin = mongoose.model('Admin');
var User = mongoose.model('User');
var auth = require('../auth');
var systemadmin = require('../../config').systemadmin;
var io = require('socket.io-client')  
var ObjectId = require('mongodb').ObjectID;


//Get all and add reservation
router.get('/',auth.optional,(req, res) => {
    Reservation.find({user:req.body.email}).then((reservations)=>{
      res.status(200).json(reservations)
    }).catch((err) => {
      res.status(500).json({
        message: err
      })
    });
});

router.post('/',auth.optional,(req, res) => {
   Parking.findById(req.body.parking).populate('owner').exec((err, parking) => {
      parking.updateLots(1)
      const reservation = new Reservation(req.body);
      reservation.save().then((newReservation)=>{
        Admin.findById(parking.owner).then((admin)=>{
          admin.addBalance((newReservation.price*(parking.owner.share))/100)
        })
        Admin.find({isadmin:true}).then((admin)=>{
          admin.addBalance((newReservation.price*(100-parking.owner.share))/100)
        })
        req.io.sockets.emit('update', "reservations");
        res.status(200).json({
          newReservation
        })
      }).catch((err) => {
          res.status(500).json({
            message: err
          })
        });
    });
    
});


router.get('/dashboard',auth.required, (req, res) => {
  Reservation.
  find().
  populate('parking').
  exec(function(error, doc) {
    if(error) res.status(500).json(error)
    res.status(200).json(doc);
  });
});


module.exports = router;