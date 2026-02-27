var session = require('express-session'); 
var passport = require('passport');
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var questsRouter = require('./routes/quests');
var shopRouter = require('./routes/shop');
var droppedItemsRouter = require('./routes/droppedItems');
var leaderboardRouter = require('./routes/leaderboard');
var arenaRouter = require('./routes/arena');

var app = express();

var db = require('./models');

db.sequelize.sync()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

require('./config/passport')(passport);

app.use(session({
  secret: process.env.SECRET_KEY || 'secret_key_backup', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(async function(req, res, next) {
  
  if (req.user) {
    try {
      const hero = await db.Hero.findOne({ where: { userId: req.user.id } });
      req.user.Hero = hero; 
    } catch (err) {
      console.error("Грешка при зареждане на герой в middleware:", err);
    }
  }

  res.locals.currentUser = req.user; 
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/quests', questsRouter);
app.use('/shop', shopRouter);
app.use('/items', droppedItemsRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/arena', arenaRouter);

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

module.exports = app;