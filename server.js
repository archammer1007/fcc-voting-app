require('dotenv').config();
require('babel-register');
var routes = require('./app/routes/routes.js');
var express = require('express');
var session = require('express-session');
var app = express();
var port = process.env.PORT || 8080;

var mongoose = require('mongoose');
var passport = require('passport');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

//using jade templating
app.use(express.static(__dirname + '/public'));
app.engine('jade', require('jade').__express)
app.set('view engine', 'jade')

//persistent sessions
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
    }))
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash());

routes(app, passport);

app.listen(port);
console.log('listening on port ' + port);