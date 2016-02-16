/*
   * Copyright 2016 NIIT Ltd, Wipro Ltd.
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *    http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    *
    * Contributors:
    *
    * 1. Abhilash Kumbhum
    * 2. Anurag Kankanala
    * 3. Bharath Jaina
    * 4. Digvijay Singam
    * 5. Sravani Sanagavarapu
    * 6. Vipul Kumar
*/

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config =  require('./config');

// Express modules
var express       = require('express'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    path          = require('path'),
    logger        = require('morgan'),
    favicon       = require('serve-favicon'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    slug          = require('slug');



// Developer defined modules
var  db                = require('./models/db'),
    execute            = require('./routes/execute_query'),
    discover           = require('./routes/discover'),
    queryController    = require('./routes/queryController'),
    routes             = require('./routes/index'),
    users              = require('./routes/users'),
    login              = require('./routes/login'),
    serverCredentials  = require('./routes/serverCredentials');
    widgetRouter  = require('./routes/widgetRouter');

// initializing express application
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    app.use(express.static(path.join(__dirname, 'public')));
} else if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.normalize(__dirname + '/../public')));
}
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use('/', login);
app.use('/home', routes);
app.use('/users', users);
app.use('/execute', execute);
app.use('/discover', discover);
app.use('/serverCredentials', serverCredentials);
app.use('/query', queryController);
app.use('/widget', widgetRouter);


// passport config
var Account = require('./models/userDetails');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
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

module.exports = app;
