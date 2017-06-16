var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');
var multer  = require('multer')
var SocketIO  = require('socket.io')


var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

  mongoose.connect('mongodb://root:toor@ds159050.mlab.com:59050/parking-api');
  mongoose.set('debug', true);

require('./models/Parkingowner');
require('./models/Parking');
require('./models/Reservation');
require('./models/User');
require('./config/passport');

app.use(require('./routes'));



/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
let server = app.listen( process.env.PORT || 5000, function(){
  console.log('Listening on port ' + server.address().port);
});
let io = SocketIO(server);
io.on('connection', (socket) => {  
  socket.on('update', function(msg){
    io.emit('update', msg);
  });
  socket.on('connect', function(id){
    io.emit('connect', id);
  });
  socket.on('entry', function(id){
    io.emit('entry', id);
  });
  socket.on('departure', function(id){
    io.emit('departure', id);
  });
})

app.use(function(req,res,next){
    req.io = io;
    next();
});

