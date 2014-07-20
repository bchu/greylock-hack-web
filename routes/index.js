var express = require('express');
var socketServer = require('./../lib/socket-server');
var router = express.Router();

/* Update iphone animation */
router.post('/update', function(req, res) {
  socketServer.updateAnimation(req.body.quaternion); 
  res.end();
});

router.post('/screencast', function(req, res) {
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log(filename);
    console.log(typeof file);
    socketServer.updateScreencast(file);
  });
  res.end();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
