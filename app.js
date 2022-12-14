var createError = require('http-errors');

var flash = require('express-flash');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var session = require('express-session');
var bodyParser = require('body-parser');

var fileupload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ques_ans = require("./routes/ques_ans");
var postans = require("./routes/post_ans");
var resetpass = require('./routes/resetPassword')


var app = express();
app.use(session({
    secret: 'miniproject',
    resave: true,
    saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quesans', ques_ans);
app.get('/postans/:QuestionID', postans);
app.use('/postans', postans);
app.get('/myans/:QuestionID', indexRouter);
app.get('/tagsredirect/:tag', indexRouter);
app.use('/reset-pass', resetpass)
app.get('/upvote/:uid', indexRouter)

app.use(flash());
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