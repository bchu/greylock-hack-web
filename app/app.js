var http = require('http');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var app = express();
module.exports = app;

var socketServer = require('./socket-server');
var port = process.env.PORT || 3000;
console.log('Connect on port: ', port);
var server = http.Server(app).listen(port);
socketServer.listen(server);

// parsing
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// view engine setup
var routes = require('./routes');
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

