var express = require('express');
var router = express.Router();
var passport = require('passport');
var hresp = require('../resources/response');
var Employee = require('../models/employee.js');
var jwt = require('jsonwebtoken');


router.post('/login',
    function(req, res) {
        // find the user
        Employee.findOne({
            username: req.body.username
        }, function(err, user) {

            console.log(user);
            if (err) throw err;

            if (!user) {
                res.status(401);
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                if (!user.validPassword(req.body.password)) {
                    res.status(401);
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, 'shhhhh', {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    //return the information including token as JSON
                    res.json({
                        _id: user._id,
                        username: user.username,
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
            }
        });
});

router.get('/profile', function(req, res) {
    if(req.isAuthenticated()) {
        var employee = new Employee();
        employee = req.user;
        employee.password = undefined;
        hresp.SuccessFind(res, req.user)
    } else {
        hresp.Unauthorized(res);
    }
});

router.post('/logout', function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
        hresp.CustomMessage(res, "logged out successfull");
    } else {
        hresp.Unauthorized(res);
    }
    });

//need help here, i don't know how to send messages back from within local-signup, or send name to the local strategy
router.post('/employees',
    passport.authenticate('local-signup'),
    function(req, res) {
    Employee.findById(req.user._id, function(err, employee){
        if(err) {
            hresp.CustomErrorMessage(res, 'please contact developers')
            //if code shows this error something goes very wrong
            //code is supposed to create user, if that fails code will never come here.
            //after that it will search for the just created user
            //so if that user is not found, something strange is happening and closer examination is needed
        }
        employee.name = req.body.name;
        employee.save(function(err){
            if (err){
                hresp.ErrorSaving(res, err);
            }
            if(req.body.category_id){
                employee.update(
                { $push: {category: req.body.category_id} }, function (err) {
                    if (err){
                        hresp.CustomErrorMessage(res, 'Error adding category');
                        return;
                    }
                    employee.password = undefined;
                    hresp.SuccessSaving(res, employee);
                });
            }else{
                employee.password = undefined;
                hresp.SuccessSaving(res, employee);
            }
        })
    })
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    else
        hresp.Unauthorized(res);
    // if they aren't redirect them to the home page
}

module.exports = router;
