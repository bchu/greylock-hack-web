var socketio = require('socket.io');
var WebSocketServer = require('ws').Server;
var app = require('../app');
var _ = require('lodash');
var io;

exports.listen = function(server, port) {
  io = socketio(server, {
    destroyUpgrade: false
  });
  io.sockets.on('connection', function (socket) {
    console.log('connection!');  
  });
  setupPhoneWebSocket(port);
};

exports.updateAnimation = _.throttle(function(body){
  var data = {
    'quaternion': body.quaternion,
    'accelerationX':body.accelerationX * 9.81,
    'accelerationY':body.accelerationY * 9.81,
    'accelerationZ':body.accelerationZ * 9.81,
    'utcMilliseconds': new Date().getUTCMilliseconds()
  };
  io.sockets.emit('update', data); 
}, 16);

exports.updateScreencast = _.throttle(function(file){
  io.sockets.emit('update screencast', file);
}, 16);

exports.updatePosition = getUpdatePosition(); 

function getUpdatePosition(){
  var lastCalled = 0;
  function updatePosition (accelX, accelY, accelZ) {
    // console.log(accelX, accelY, accelZ);
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

var setupPhoneWebSocket = function(port) {
  var wss = new WebSocketServer({port: 2000, path: '/socket'});
  wss.on('connection', function(ws) {
    console.log('Websocket connection from iPhone!');
      ws.on('message', function(message, flags) {
          if (!flags.binary) {
            var data = JSON.parse(message);
            if (data.quaternion) {
              exports.updateAnimation(data);
            }
          }
          else {
            exports.updateScreencast(message);
          }
      });
  });
};
