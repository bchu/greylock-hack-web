var socketio = require('socket.io');
var WebSocketServer = require('ws').Server;
var io;

exports.listen = function(server) {
  io = socketio(server);
  io.sockets.on('connection', function (socket) {
    console.log('connection!');  
  });
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

var wss = new WebSocketServer({port: 2000});
wss.on('connection', function(ws) {
  console.log('Websocket conn!');
    ws.on('message', function(message, flags) {
        if (!flags.binary) {
          var data = JSON.parse(message);
          if (data.quaternion) {
            updateAnimation(data.quaternion);
          }
        }
        else {
          exports.updateScreencast(message);
        }
    });
});
