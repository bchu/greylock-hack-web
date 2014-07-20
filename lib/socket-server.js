var socketio = require('socket.io');
var WebSocketServer = require('ws').Server;
var app = require('../app');
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

exports.updateAnimation =  updateAnimation;

function updateAnimation(quaternion){
 var data = {
    'quaternion': quaternion
  };
  io.sockets.emit('update rotation', data); 
}

exports.updateScreencast = function(file){
  io.sockets.emit('update screencast', file);
};

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
      io.sockets.emit('update position', data);
    }
  }
  return updatePosition;
}

var setupPhoneWebSocket = function(port) {
  var wss = new WebSocketServer({port: port, path: '/socket'});
  wss.on('connection', function(ws) {
    console.log('Websocket conn!');
      ws.on('message', function(message, flags) {
          if (!flags.binary) {
            var data = JSON.parse(message);
            if (data.quaternion) {
              // console.log(data.quaternion);
              updateAnimation(data.quaternion);
              exports.updatePosition(data.accelerationX,
                                     data.accelerationY,
                                     data.accelerationZ);
            }
          }
          else {
            exports.updateScreencast(message);
          }
      });
  });
};
