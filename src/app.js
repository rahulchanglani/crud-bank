
var path = require('path'),
  express = require('express'),
  exctrl = require('exctrl'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  morgan = require('morgan');

module.exports = function () {
  var app = app = express();

  app.use(bodyParser.json({ limit: '7mb' }));
  app.use(bodyParser.urlencoded({ limit: '7mb', extended: true }));

  app.use(session({
    cookieName: 'session',
    secret: 'jwtAuth',
    duration: 60 * 100
    // saveUninitialized: true  
    // resave: true,    
    // activeDuration: 5 * 60 * 1000,
  }));
  app.use(cookieParser());


  // use morgan to log requests to the console
  app.use(morgan('dev'));

  exctrl
    .bind(app)
    .load({
      pattern: __dirname + '/api/**/*.controller.js',
      prefix: 'api',
      nameRegExp: /([^\/\\]+).controller.js$/
    });

  if (process.env.NODE_ENV === 'development') {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(__dirname, 'app')));
    app.use(express.static(path.join(__dirname, '..', '.tmp')));
    app.use(express.static(path.join(__dirname, '..', 'bower_components')));
  }

  if (process.env.NODE_ENV === 'production') {
    //app.use(express.static(path.join(__dirname, '..', 'dist')));
    app.use(express.static(path.join(__dirname, 'app')));
    app.use(express.static(path.join(__dirname, '..', '.tmp')));
    app.use(express.static(path.join(__dirname, '..', 'bower_components')));
  }

  return app;

};
