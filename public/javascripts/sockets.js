var socket;
var initializeSocket = function() {
  socket = new WebSocket('ws://');
  socket.addEventListener('open', function(e) {
    console.log('WebSocket opened!');
  });
  var nextEvent;
  socket.addEventListener('message', function(e) {
    var data = e.data;
    if (typeof data == 'string') {
      data = JSON.parse(data);
      // event name
      if (typeof data == 'string') {
        nextEvent = data;
      }
      else {
        runCallbacks(nextEvent, data);
        nextEvent = null;
      }
    }
    else {
      runCallbacks(nextEvent, data);
      nextEvent = null;
    }
  });
  socket.addEventListener('close', function(e) {
    console.log('Closed:', e.code, e.reason);
    attemptReconnection();
  });
  socket.addEventListener('error', function(e) {
    attemptReconnection();
  });
};

var called = false;
var attemptReconnection = function() {
  if (called) {
    return;
  }
  called = true;
  setTimeout(function() {
    // closed
    called = false;
    if (socket.readyState === 3) {
      initializeSocket();
      attemptReconnection(); // check again in 2 seconds
    }
  }, 2000);
};

var callbacks = {};
var addSocketListener = function(event, callback) {
  var listeners = callbacks[event];
  if (listeners) {
    listeners.push(callback);
  }
  else {
    callbacks[event] = [callback];
  }
};
var runCallbacks = function(event, data) {
  var listeners = callbacks[event];
  for (var i = 0 ; i < listeners.length; i++ ) {
    listeners[i](data);
  }
};