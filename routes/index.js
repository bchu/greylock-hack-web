var express = require('express');
var router = express.Router();

/* Update iphone animation */
router.post('/update', function(req, res) {
  console.log(req.body.roll + ', ' + req.body.yaw + ', ' + req.body.pitch);
  res.end();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
