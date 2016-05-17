module.exports = function(router, Customer, Chat, Category, hresp, io, Notification, File){

    router.route('/customers')
        .post(function(req, res){
            var customer = new Customer();
            customer.name = req.body.name;
            customer.registrationId = req.body.registrationId;


            customer.os = req.body.os;



        customer.save(function(err){
            if(err){
                hresp.ErrorSaving(res, err);
            }
            hresp.SuccessSaving(res, customer);
        });
    })
        .get(function(req, res){
        Customer.find(function(err, customers){
            if(err){
                hresp.ErrorFind(res, err);
            }
            hresp.SuccessFind(res, customers);
        });
    });

    router.route('/customers/:customer_id')
        .get(function(req, res){
            Customer.findById(req.params.customer_id, function(err, customer){
                if(err){
                    hresp.ErrorFind(res, err);
                }
                hresp.SuccessFind(res, customer);
            });
        })
        .put(function(req, res){
            Customer.findById(req.params.customer_id, function(err, customer){
                if(err) {
                    hresp.ErrorUpdate(res, err);
                    return;
                }

                customer.name = req.body.name;

                customer.save(function(err){
                    if(err){
                        hresp.ErrorSaving(res, err);
                    }

                    hresp.SuccessUpdate(res);
                });
            });
        })
        .delete(function(req, res){
            Customer.findById(req.params.customer_id, function(err, customer) {
                if (err) hresp.ErrorDelete(res, err);

                customer.update({active:false}, function(err, result) {
                    if (err) hresp.ErrorDelete(res, err);

                    hresp.SuccessDelete(res);
                });
            });
        });

    //router.route('/customers/:customer_id/chats')
    //    .get(function(req, res){
    //
    //});

    router.route('/customers/:customer_id/chats')
        .get(function(req, res){

            Chat.find({customer: req.params.customer_id})
                .populate('customer category employees messages.user messages.employee')
                .sort({updated_at: 'desc'})
                .exec(function(err, chats){
               if(err){
                   hresp.ErrorFind(res, err);
               }
                hresp.SuccessFind(res, chats);
            });
        })
        .post(function(req, res){

            if(!req.body.category){
                hresp.ErrorSaving(res);
                return;
            }

            var newChat = new Chat();
            newChat.customer = req.params.customer_id;
            newChat.category = req.body.category;
            newChat.messages.push({isEmployee: false, text: "Welkom bij de sns chat app, er wordt op dit moment een medewerker gekoppelt aan uw vraag.", timeStamp: new Date(), system: true});
            newChat.messages.push({user: req.params.customer_id, isEmployee: false, text: req.body.message, timeStamp: new Date()});

            newChat.save(function(err){
                if(err) {
                   hresp.ErrorSaving(res, err);
                }

                Chat.findById(newChat._id)
                    .populate('customer category employees messages.user messages.employee')
                    .exec(function(err, result) {
                        if (err) hresp.ErrorFind(res, err);

                        hresp.SuccessSaving(res, result);
                    });
            });
        });

    router.route('/customers/:customer_id/chats/:chat_id/messages')
        .get(function(req, res){

            Chat.findById(req.params.chat_id)
                .populate('customer category employees messages.user messages.employee')
                .exec(function(err, chat){
               if(err){
                   hresp.ErrorFind(res, err);
                   return;
               }

                    //var newMessages = [];
                    //for(var i = 0; i < chat.messages.length; i++){
                    //    if(chat.messages[i].isNewMessage){
                    //        chat.messages[i].isNewMessage = false;
                    //        newMessages.push(chat.messages[i]);
                    //    }
                    //}
                hresp.SuccessFind(res, chat);
            });
        })
        .post(function(req, res){
            Chat.findByIdAndUpdate(req.params.chat_id, {updated_at: new Date(), solved: false, $push: {messages: {user: req.params.customer_id, isEmployee: false, isNew : true, text: req.body.message, timeStamp: new Date()}}}).populate("messages.user").exec( function(err, chat){
               if(err){
                   hresp.ErrorSaving(res, err);
                   return;
               }
                if (chat.employees.length > 0){
                    io.to(chat.employees[chat.employees.length -1]._id).emit('notification', { data: req.body.message , chatId : req.params.chat_id});
                    io.emit('message', { hello: 'world' });
                    var notification = new Notification();
                    notification.ChatId = req.params.chat_id;
                    notification.EmployeeID = chat.employees[chat.employees.length -1];
                    notification.message = req.body.message;
                    notification.save(function(err){
                        if (err){
                            console.log('saving notification from customer trows an error');
                        }
                    });
                }

                hresp.SuccessSaving(res, chat.messages[chat.messages.length -1])
            });
        });

    router.route('/customers/:customer_id/chats/:chat_id/files')
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

    router.route('/customers/:customer_id/chats/:chat_id/files/:file_id')
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
