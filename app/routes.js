var express = require('express');
var router = express.Router();
module.exports = router;

// Views:

router.get('/', function(req, res) {
  res.render('index');
  res.end();
});

router.get('/video', function(req, res) {
  res.render('video');
  res.end();
});

