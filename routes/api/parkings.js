var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Parking = mongoose.model('Parking');
var Admin = mongoose.model('Admin');
var auth = require('../auth')
var multer  = require('multer')
var destination = '/uploads/'
var filename = (req, file, cb) => cb(null, file.originalname)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })


//Get all parkings
router.get('/', auth.optional,(req, res) => {
        Parking.find().populate('owner').exec((err,parkings)=>{
          if (err) {
            return res.send(err);
          }
          res.status(200).json(parkings)
        })
});

//Get parkings by owner
router.get('/byowner',auth.optional,(req, res) => {
        Parking.find({'owner':req.payload.id}).populate('owner').exec((err,parkings)=>{
          if (err) {
            return res.send(err);
          }
          res.status(200).json(parkings)
        })
});

//Add new parkings
router.post('/',auth.optional,(req, res,next) => {
    var parking = new Parking(req.body);
    parking.owner = req.payload.id;
    req.io.sockets.emit('connect', req.body.deviceid);
    parking.save().then((newParking)=>{
      res.status(200).json({
        success: true,
        data: newParking
      })
    }).catch((err) => {
      res.status(500).json({
        message: err
      })
    });
});


//Retrieving a parking
router.get('/:id',auth.required, (req, res) => {
  Parking.findOne({ _id: req.params.id}, function(err, parking) {
    if (err) {
      return res.send(err);
    }
    res.json(parking);
  });
});

router.put('/:id', auth.required, function(req, res, next){
  Parking.findById(req.params.id).then(function(parking){
    if(!parking){ return res.sendStatus(401); }
    console.log(req.body.parking)
    parking = req.body.parking;
    return parking.save().then(function(){
      return res.json({parking: parking.toAuthJSON()});
    });
  }).catch(next);
});

//Deleting a parking
router.delete('/:id',(req, res) => {
  Parking.remove({
    _id: req.params.id
  }, function(err, parking) {
    if (err) {
      return res.send(err);
    }

    res.json({ message: 'Successfully deleted' });
  });
});

//upload image
router.post('/upload',upload.single('image'), function(req, res, next) {
       const url = req.protocol + '://' + req.get('host') ;
       res.status(200).json( {url:url+'/upload/temp/'+req.file.filename} );
       res.end();
});


module.exports = router;