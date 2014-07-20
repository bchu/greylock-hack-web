var socketio = require('socket.io');
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
}
