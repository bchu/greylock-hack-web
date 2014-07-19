var socketio = require('socket.io');
var io;

exports.listen = function(server) {
  io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    console.log('connection!');  
  });
}

// Updates the animation's roation with the given
// euler coordinates
exports.updateAnimation = function(roll, pitch, yaw){
 var data = {
  'x': roll,
  'y': pitch,
  'z': yaw,
 }
 io.sockets.emit('update rotation', data); 
}
