var express = require('express');
var socketServer = require('./../lib/socket-server');
var router = express.Router();

/* Update iphone animation */
router.post('/update', function(req, res) {
  socketServer.updateAnimation(req.body.quaternion); 
  // console.log(req.body.accelerationX, req.body.accelerationY, req.body.accelerationZ);
  socketServer.updatePosition(req.body.accelerationX, 
                              req.body.accelerationY, 
                              req.body.accelerationZ); 
  res.end();
});

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

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
  res.end();
});

module.exports = router;
