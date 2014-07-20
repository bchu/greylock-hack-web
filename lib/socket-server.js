var socketio = require('socket.io');
var WebSocketServer = require('ws').Server;
var io;

exports.listen = function(server) {
  io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    console.log('connection!');  
  });
};

// Updates the animation's roation with the given
// euler coordinates
exports.updateAnimation = function(quaternion){
 var data = {
  'quaternion': quaternion
 };
 io.sockets.emit('update rotation', data); 
};

exports.updateScreencast = function(file){
  io.sockets.emit('update screencast', file);
};


var wss = new WebSocketServer({port: 3000, path:'updateWS'});
wss.on('connection', function(ws) {
  console.log('Websocket conn!');
    ws.on('message', function(message) {
        console.log('received: %s', message);
    });
    // ws.send('something');
});