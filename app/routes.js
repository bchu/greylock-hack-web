var socketServer = require('./socket-server');
var express = require('express');
var app = require('./app');
var busboy = require('connect-busboy');
app.use(busboy());

var router = express.Router();
module.exports = router;


// gyro update fallback
router.post('/update', function(req, res) {
  socketServer.updateAnimation(req.body); 
  res.end();
});

// image update:
router.post('/screencast', function(req, res) {
  req.pipe(req.busboy);
  var data ;
  req.busboy.on('file', function (fieldname, filestream, filename) {
    filestream.on('data', function(chunk) {
      if (!data) { data = chunk; }
      else {
        data = Buffer.concat([data, chunk]);
      }
    });

    filestream.on('end', function() {
      socketServer.updateScreencast(data);
    });
  });
  res.end();
});


// views:

router.get('/', function(req, res) {
  res.render('index');
  res.end();
});

router.get('/video', function(req, res) {
  res.render('video');
  res.end();
});

