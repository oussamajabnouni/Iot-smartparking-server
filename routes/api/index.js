var router = require('express').Router();

router.use('/', require('./parkingowners'));
router.use('/parkings', require('./parkings'));
router.use('/users', require('./users'));
router.use('/reservations', require('./reservations'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;