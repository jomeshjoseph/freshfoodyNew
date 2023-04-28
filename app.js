var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser=require('body-parser')
var session = require('express-session')
const nocache = require("nocache");
require('dotenv').config(); 

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure


// 






var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var hbs=require('express-handlebars');
const { handlebars } = require('hbs');

var app = express();
var db=require('./config/connection')

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs',defaultLayout:'Layout',layoutsDir:__dirname+'/views/layout/',partialDir:__dirname+'/views/partials/'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:600000}}))
app.use(nocache());

db.connect((err)=>{
  if(err) console.log('connection error'+ err)
  else console.log("Database connected to port 27017")
})

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use(bodyParser.urlencoded({ extended: false }));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function(){
  client.messages
  .create({
    body: 'Hello from twilio-node',
    to: '+12345678901', // Text your number
    from: '+12345678901', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid)); 
})

module.exports = app;
