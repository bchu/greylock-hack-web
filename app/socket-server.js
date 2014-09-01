var socketio = require('socket.io');
var WebSocketServer = require('ws').Server;
var app = require('./app');
var _ = require('lodash');
var io;

var router = require('./routes');
var videos = {};
var videoCount = 0;
router.get('/video/:path', function(req, res) {
  res.set('Content-Type', 'video/mp4');
  res.send(videos[req.params.path]);
  res.end();
});

exports.listen = function(server) {
  io = socketio(server, { destroyUpgrade: false }); // this is the key to getting ws to work with socket.io
  io.sockets.on('connection', function (socket) {
    console.log('socket.io connection to browser');
  });
  setupPhoneWebSocket(server);
};

var setupPhoneWebSocket = function(server) {
  var wss = new WebSocketServer({server: server, path: '/socket'});
  wss.on('connection', function(ws) {
    console.log('ws connection from iPhone');
    // reset:
    videos = {};
    videoCount = 0;
    ws.on('message', function(message, flags) {
      // motion/gyro data:
      if (!flags.binary) {
        var motionData = JSON.parse(message);
        exports.updateAnimation(motionData);
      }
      // video data:
      else {
        exports.updateVideo(message);
      }
    });
  });
};

exports.updateVideo = _.throttle(function(videoData) {
  // message is a buffer instance:
  delete videos[videoCount-6]; // remove old video cache
  videos[videoCount] = videoData;
  console.log('video is now on number', videoCount);
  io.sockets.emit('update video', videoCount);
  videoCount++;
}, 16);

// only run every 16 ms (60fps)
exports.updateAnimation = _.throttle(function(body){
  var data = {
    'quaternion': body.quaternion,
    'accelerationX': body.accelerationX * 9.81,
    'accelerationY': body.accelerationY * 9.81,
    'accelerationZ': body.accelerationZ * 9.81,
    'utcMilliseconds': new Date().getUTCMilliseconds()
  };
  io.sockets.emit('update', data); 
}, 16);

// experimental work on acceleration:
exports.updatePosition = getUpdatePosition(); 
function getUpdatePosition(){
  var lastCalled = 0;
  function updatePosition (accelX, accelY, accelZ) {
    if (lastCalled === 0) {
      lastCalled = Date.now();
    } else {
      now = Date.now();
      delta = 0.001; 
      data = { x: accelX,
               y: accelY,
               z: accelZ };
      // io.sockets.emit('update position', data);
    }
  }
  return updatePosition;
}

// var ffmpeg = require('fluent-ffmpeg');

/*
 replicates this sequence of commands:

 ffmpeg -i title.mp4 -qscale:v 1 intermediate1.mpg
 ffmpeg -i source.mp4 -qscale:v 1 intermediate2.mpg
 ffmpeg -i concat:"intermediate1.mpg|intermediate2.mpg" -c copy intermediate_all.mpg
 ffmpeg -i intermediate_all.mpg -qscale:v 2 output.mp4

 Create temporary .mpg files for each video and deletes them after merge is completed.
 These files are created by filename pattern like [videoFilename.ext].temp.mpg [outputFilename.ext].temp.merged.mp4
 */


exports.handleVideo = function(message) {
  io.sockets.emit('update video', message);
};
