//Node modules
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var hresp = require('./resources/response.js');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var auth = require('basic-auth');
var jwt = require('jsonwebtoken');
var jwtC = require('express-jwt');
var jwtCheck = jwtC;
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
var jwtCheck = jwtC({
    secret: 'shhhhh'
});
var config = require('./config/config.js')();
//make app and router
var router = express.Router();
var app = express();
// call socket.io to the app
app.io = require('socket.io')();


//models
var Chat = require('./models/chat.js');
var Customer = require('./models/customer.js');
var Category = require('./models/category.js');
var Employee = require('./models/employee.js');
var Notification = require('./models/notification.js');
var FAQ = require('./models/faq.js');
var File = require('./models/file.js');

//configuration
mongoose.connect(config.database);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//Required for passport
require('./config/passport')(passport); // pass passport for configuration
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//declare routes
var authenticateRoutes = require('./routes/authenticate_routes.js');
var customerRoutes = require('./routes/customer_routes.js')(router, Customer, Chat, Category, hresp, app.io, Notification, FAQ, File);
var categoryRoutes = require('./routes/category_routes.js')(router, Category, hresp);
var employeeRoutes = require('./routes/employee_routes.js')(router,Employee, Customer, Chat, Category, hresp, app.io, Notification);
var faqRoutes = require('./routes/faq_routes.js')(router, FAQ, Category, Customer, hresp);

//load in routes
app.use('/api', router);
//app.use('/', router);

//Middleware
router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!!'
    });
});

// start listen with socket.io
app.io.on('connection', function(socket){
  console.log('IMA CHRGN MA LZR');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.reqlink = req.url
    next(err);
});

// error handlers->
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
