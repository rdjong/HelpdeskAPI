var passport = require('passport');
module.exports = function(router, Employee, Customer, Chat, Category, hresp, io, Notification){


    router.route('/employees')
        .get(function(req, res){
            Employee.find({active: true}).exec(function(err, employees){
                if(err){
                    hresp.ErrorFind(res, err);
                    return;
                }
                for (i = 0; i< employees.length; i++){
                    employees[i].password = undefined;
                }
                hresp.SuccessFind(res, employees);
            });
    });

    router.route('/employees/:employee_id')
        .get(function(req, res){
            Employee.findById(req.params.employee_id, function(err, employee){
                if(err){
                    hresp.ErrorFind(res, err);
                }
                employee.password = undefined;
                hresp.SuccessFind(res, employee);
            });
    })

    .post(function(req, res){
        if(!req.isAuthenticated()){
            Employee.findById(req.params.employee_id, function(err, employee){
                    if(err) {
                        hresp.ErrorUpdate(res, err);
                        return;
                    }
                    if (req.body.category_id){
                        employee.update({ $push: {category: req.body.category_id} }, function (err) {
                            if (err){
                                hresp.CustomErrorMessage(res, 'Error adding category');
                                return;
                            }
                        });
                    }
                hresp.SuccessUpdate(res, employee);
            });
        }
    })

        .put(function(req, res){
                Employee.findById(req.params.employee_id, function(err, employee){
                    if(err) {
                        hresp.ErrorUpdate(res, err);
                        return;
                    }

                    if (req.body.name){
                        employee.name = req.body.name;
                    }
                    if (req.body.username){
                        employee.username = req.body.username;
                    }
                    if (req.body.password){
                        employee.password = employee.generateHash(req.body.password);
                    }
                    if (req.body.category_id){
                        employee.category = undefined;
                    }

                    employee.save(function(err){
                        if(err){
                            hresp.ErrorSaving(res, err);
                        }

                        if (req.body.category_id){
                            employee.update(
                                { $push: {category: req.body.category_id} }, function (err) {
                                    if (err){
                                        hresp.CustomErrorMessage(res, 'Error adding category');
                                        return;
                                    }
                                });
                        }
                        hresp.SuccessUpdate(res, employee);
                    });
                });

        })

        .delete(function(req, res){
            Employee.findById(req.params.employee_id, function(err, employee) {
               if (err) hresp.ErrorDelete(res, err);
                console.log(err);

                employee.update({active:false}, function(err, result) {
                   if (err) hresp.ErrorDelete(res, err);
                    console.log(err);

                    hresp.SuccessDelete(res);
                });
            });

    });

    router.route('/employees/:employee_id/notifications')
        .get(function(req, res){
                Notification.find({'EmployeeID': req.params.employee_id}, function(err, notifications) {
                    if (err){
                            hresp.ErrorFind(res, err);
                        }
                    hresp.SuccessFind(res, notifications);
                });
    });

    router.route('/employees/:employee_id/notifications/:notification_id')
        .get(function(req, res){
            Notification.remove({
                _id: req.params.notification_id
            }, function(err, notification){
                if(err){
                    hresp.ErrorDelete(res, err);
                }
                hresp.SuccessDelete(res);
            });
    });


    //TODO: nog niet klaar
    router.route('/employees/chats/:category_id')
        .get(function(req, res){
            var chats = Chat.find({});
            var employeeChats = [];

            Employee.findById(req.params.employee_id, function(err, employee){//alle chats terug halen
                if(err){
                    hresp.ErrorFind(res, err);
                }

                hresp.SuccessFind(res, chats);
            });
    });

    //get all chats(no employeeID needed)
    router.route('/employees/:employee_id/allchats')
        .get(function(req, res){
            Chat.find({})
                .populate('customer category employees messages.user messages.employee')
                .exec(function(err, chats){
                if(err){
                    hresp.ErrorFind(res, err);
                }

                hresp.SuccessFind(res, chats);
            });

    });

    //add a chat to employee
    router.route('/employees/:employee_id/chats/:chat_id')
        .put(function(req, res){
            Chat.findById(req.params.chat_id).populate('customer').exec(function(err, chat){
                if(err) {
                    hresp.ErrorFind(res, err);
                }

                Employee.findById(req.params.employee_id, function(err, employee) {
                    if (err) hresp.ErrorFind(res, err);

                    var text = 'De chat is overgedragen aan ' + employee.username;

                    chat.update({$push: {employees: req.params.employee_id, messages: {isEmployee: false, system: true, isNewMessage: true, text: text ,timeStamp: new Date()}}},
                        function(err, outputchat){
                            if(err) hresp.ErrorFind(res, err);

                            if(chat.customer.registrationId) {
                                if (chat.customer.os == "IOS") {
                                    //TODO send push notification to iPhone.
                                } else {
                                    var registrationIds = [];
                                    var message = new gcm.Message();
                                    message.addData('message', {data: {chatId: chat._id, notificationMessage: text, completeMessage: {
                                        user: null,
                                        employee: null,
                                        isEmployee: false,
                                        text: text,
                                        timeStamp: new Date(),
                                        system: true
                                    },
                                    employee: employee}});
                                    registrationIds.push(chat.customer.registrationId);

                                    sender.send(message, registrationIds, 10, function (err, result) {
                                        if (err) console.error(err);
                                        //else    console.log(result);
                                    });
                                }
                            }

                            hresp.SuccessSaving(res, outputchat);
                        });
                });
            });

    });


    //get all chats from a certain employee
    router.route('/employees/:employee_id/chats')
        .get(function(req, res){
            //get employee
            var employee;
            Employee.findById(req.params.employee_id,function(err, emp) {
                if (err) {
                    hresp.ErrorFind(res, err);
                }
                employee = emp;
            });
            Chat.find({employees: req.params.employee_id})
                .populate('customer category employees messages.user messages.employee')
                .exec(function(err, chats){
                if(err) {
                    hresp.ErrorFind(res, err);
                }

                //push employee to values
                var values = {};
                values['employee'] = employee;
                values['chats'] = chats;
                //first value employee second value employee chats
                hresp.SuccessFind(res, values);
            });
    });


    router.route('/employees/:employee_id/chats/:chat_id/solve')
        .post(function(req, res) {
                Chat.findById(req.params.chat_id).populate("customer").exec(function(err, chat) {
                    if (err) {
                        hresp.ErrorFind(res, err);
                    } else {
                        var text = "De medewerker heeft uw vraag op de status opgelost gezet. " +
                            "Bent u het hier niet mee eens kunt u de chat hervatten door een bericht " +
                            "te sturen in uw chat.";

                        chat.update({solved: true, $push: {messages: {isEmployee: false, system: true, isNewMessage: true, text: text ,timeStamp: new Date()}}},
                            function(err, outputchat){
                                if(err) hresp.ErrorFind(res, err);

                                if(chat.customer.registrationId) {
                                    if (chat.customer.os == "IOS") {
                                        //TODO send push notification to iPhone.
                                    } else {
                                        var registrationIds = [];
                                        var message = new gcm.Message();
                                        message.addData('message', {data: {chatId: chat._id, notificationMessage: text, completeMessage: {
                                            user: null,
                                            employee: null,
                                            isEmployee: false,
                                            text: text,
                                            timeStamp: new Date(),
                                            system: true
                                        }}});
                                        registrationIds.push(chat.customer.registrationId);

                                        sender.send(message, registrationIds, 10, function (err, result) {
                                            if (err) console.error(err);
                                            else    console.log(result);
                                        });
                                    }
                                }

                                hresp.SuccessSaving(res, outputchat);
                            });
                    }
                });
        });


    //returns the messages of a chat (employee id only needed with post)
    router.route('/employees/:employee_id/chats/:chat_id/messages')
        .get(function(req, res){
            Chat.findById(req.params.chat_id)
                .populate('customer category employees messages.user messages.employee')
                .exec(function(err, chat){
                if(err){
                    hresp.ErrorFind(res, err);
                }
                    //var newMessages = [];
                    //for(i =0 ; i < chat.messages.length; i++){
                    //    if(chat.messages[i].isNewMessage){
                    //        chat.messages[i].isNewMessage = false;
                    //        newMessages.push(chat.messages[i].isNewMessage);
                    //    }
                    //}
                    //
                    //chat.messages = newMessages;
                hresp.SuccessFind(res, chat);
            });

        })//sends a message
        .post(function(req, res){
            Chat.findById(req.params.chat_id)
                .populate('customer')
                .exec(function(err, chat){
                if(err) {
                    hresp.ErrorFind(res, err);
                }

                chat.update(
                    {updated_at: new Date(), $push: {messages: {employee: req.params.employee_id ,isEmployee: true, isNewMessage : true, text: req.body.message,timeStamp: new Date()}}},
                    function(err){
                        if(err) res.send(err);

                        if(chat.customer.registrationId) {
                            Employee.findById(req.params.employee_id, function(err, employee) {
                               if (err) hresp.ErrorFind(err, employee);

                                if(chat.customer.os == "IOS"){
                                    var note = new apns.Notification();
                                    note.device = new apns.Device(chat.customer.registrationId);
                                    note.expiry = Math.floor(Date.now() / 1000) + 3600;
                                    note.badge = 3;
                                    note.sound = "ping.aiff";
                                    note.alert =  req.body.message;
                                    note.payload = {'ChatId': chat._id,'userId': req.params.employee_id,"employee" : true,"text": req.body.message,"timeStamp": new Date()};

                                    apnConnection.sendNotification(note);

                                }else{

                                    var registrationIds = [];
                                    var message = new gcm.Message();
                                    message.addData('message', {data: {chatId: chat._id, notificationMessage: req.body.message,
                                        completeMessage: {
                                            user: null,
                                            employee: employee,
                                            isEmployee: true,
                                            text: req.body.message,
                                            timeStamp: new Date(),
                                            system: false
                                        }}});

                                    registrationIds.push(chat.customer.registrationId);

                                    sender.send(message, registrationIds, 10, function (err, result) {
                                        if (err) console.error(err);
                                        //else    console.log(result);
                                    });
                                }
                            });
                        }
                        hresp.SuccessSaving(res, chat);
                    });
            });
    });

    router.route('/employees/:employee_id/chats/:chat_id/files')
        .get(function(req, res) {
            Chat.findById(req.params.chat_id).populate('files').exec(function(err, chat) {
                if (err) {
                    hresp.ErrorFind(res, err);
                } else {
                    hresp.SuccessFind(res, chat.files);
                }
            });
        })
        .post(function(req, res) {
            var file = new File;
            file.base = req.body.file;

            file.save(function(err, returnFile) {
                if (err) {
                    hresp.ErrorSaving(res, err);
                } else {
                    Chat.findByIdAndUpdate(req.params.chat_id, {$push:{files:returnFile._id}}).populate("files").exec(function(err, chat) {
                        if (err) {
                            hresp.ErrorUpdate(res, err);
                        } else {
                            hresp.SuccessSaving(res, chat.files[chat.files.length -1]);
                        }
                    })
                }
            });
        });

    router.route('/employees/:employee_id/chats/:chat_id/files/:file_id')
        .get(function(req, res) {
            File.findById(req.params.file_id, function(err, file) {
                if (err) {
                    hresp.ErrorFind(res, err);
                } else {
                    hresp.SuccessFind(res, file);
                }
            })
        });

    return router;
};
