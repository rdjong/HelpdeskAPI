module.exports = function(router, FAQ, Category, Customer, hresp){

    //FAQ routes
    router.route('/faq')
        .post(function(req, res){
        console.log('here');
        if (!req.isAuthenticated()){
            Category.findById(req.body.category_id, function(err, category){
                if (err || category === null){
                    hresp.ErrorFind(res, err);
                    return;
                }

                var newFAQ = new FAQ();
                if (!req.body.answer && !req.body.question){
                    hresp.CustomErrorMessage(res, "Missing answer & question");
                    return;
                }
                if(!req.body.question){
                    hresp.CustomErrorMessage(res, "Missing question");
                    return;
                }
                if (!req.body.answer){
                    hresp.CustomErrorMessage(res, "Missing answer");
                    return;
                }
                newFAQ.question = req.body.question;
                newFAQ.answer = req.body.answer;
                newFAQ.category = category._id;
                newFAQ.save(function(err){
                    if(err){
                        hresp.ErrorSaving(res, err);
                    }
                    var registrationIds = [];
                    var message = new gcm.Message();
                    message.addData('sync_faq', {data : {type: "post", _id: newFAQ._id, category: category, question: newFAQ.question, answer: newFAQ.answer}});
                    Customer.find(function(err, customers){

                        customers.forEach(function(customer){
                            if (customer.registrationId){
                                if (customer.registrationId !== 'NoDeviceToken')
                                    registrationIds.push(customer.registrationId);
                                console.log(customer.registrationId);
                            }
                        });

                        sender.send(message, registrationIds, 10, function (err, result) {
                            if (err) console.error(err);
                            else    console.log(result);
                        });
                    });
                    hresp.SuccessSaving(res, newFAQ);
                })
            })




        } else {
            hresp.Unauthorized(res);
        }
    })

    .get(function(req, res){
        FAQ.find()
            .populate('category')
        .exec(function(err, faq){
            if (err){
                hresp.ErrorFind(res, err);
                return;
            }
            hresp.SuccessFind(res, faq);
        })
    });

    router.route('/faq/:faq_id')
    .get(function(req, res){
        FAQ.findById(req.params.faq_id)
            .populate('category')
            .exec(function(err, faq){
            if (err){
                hresp.ErrorFind(res, err);
                return;
            }
            hresp.SuccessFind(res, faq);
        });
    })

    .put(function(req, res){
        if (!req.isAuthenticated()){
            FAQ.findById(req.params.faq_id, function(err, faq){
                if (err || !faq){
                    hresp.ErrorFind(res, err);
                    return;
                }
                if(req.body.question){
                    faq.question = req.body.question;
                    }
                if (req.body.answer){
                    faq.answer = req.body.answer;
                    }
                if (req.body.category_id){
                    faq.category = req.body.category_id;
                }

                faq.save(function(err){
                    if (err){
                        hresp.CustomErrorMessage(res, err)
                        return;
                    }

                    Category.findById(faq.category, function(err, category){
                        if (err){
                            //code hoort hier nooit te komen
                            hresp.CustomErrorMessage(res, 'something went wrong editing an FAQ and finding the category. Please contact the developers!')
                        }
                        var registrationIds = [];
                        var message = new gcm.Message();
                        message.addData('sync_faq', {data: {type: "put", _id: faq._id, category: category, question: faq.question, answer: faq.answer}});
                        Customer.find(function(err, customers){
                            customers.forEach(function(customer){
                                if (customer.registrationId){
                                    if (customer.registrationId !== 'NoDeviceToken')
                                        registrationIds.push(customer.registrationId);
                                }
                            });
                            sender.send(message, registrationIds, 10, function (err, result) {
                                if (err) console.error(err);
                                else    console.log(result);
                            });
                        });

                        hresp.SuccessUpdate(res, faq);
                        })


                })
            });
        } else {
            hresp.Unauthorized(res);
        }
    })

    .delete(function(req, res){
        if (!req.isAuthenticated()){
            FAQ.remove({ _id: req.params.faq_id }, function(err, faq){
                    if(err){
                        hresp.ErrorDelete(res, err);
                        return;
                    }
                console.log(faq);
                var registrationIds = [];
                var message = new gcm.Message();
                message.addData('sync_faq', {data: {type: "delete", id: req.params.faq_id}});
                Customer.find(function(err, customers){

                    customers.forEach(function(customer){
                        if (customer.registrationId){
                            if (customer.registrationId !== 'NoDeviceToken')
                                registrationIds.push(customer.registrationId);
                        }
                    });
                    sender.send(message, registrationIds, 10, function (err, result) {
                        if (err) console.error(err);
                        else    console.log(result);
                    });
                });
                hresp.SuccessDelete(res);
            });
        } else {
            hresp.Unauthorized(res);
        }
    });

    //TODO store comparison in a list and take the one with the highest percentage bubble sort
    router.route('/faq/compare/:compare')
        .get(function(req, res){


            var ret = false;
            var count = 0;
            var answers = [];
            FAQ.find(function(err, FAQs){



                if (err || req.params.compare === null || req.params.compare === "" ){
                    hresp.ErrorFind(res, err);
                    return;
                }

                FAQs.forEach(function(faq){


                    var c = req.params.compare;
                    var q =  faq.question;
                    var percentageCount = 0;


                    for(i=0;i< faq.question.length; i++)
                    {
                        for(j=0;j< req.params.compare.length; j++)
                         {

                                 if (c.substr(j, 1)!=="*"&& q.substr(i, 1).indexOf(c.substr(j, 1)) > -1) {
                                     //q.replace(q.substr(i, 1), "*")
                                     c.replace(c.substr(j, 1), "*");
                                     percentageCount++;
                                     j = req.params.compare.length;

                                 }

                             }

                         }

                    if((percentageCount/(faq.question.length-1))>=0.80 )
                        //&& (faq.question.length <= req.params.length+5)  )
                    {
                        answers[count] = {faq:faq, percent:percentageCount}
                        count++;
                    }

                });

                if(answers[0] != null)
                {

                    var answer;
                    var max = 0.0;
                    for(i =0;i<answers.length;i++) {
                        if(max < answers[i].percent){
                            max = answers[i].percent;
                            answer = answers[i].faq;
                        }

                    }

                    hresp.SuccessFind(res, answer);
                    return;
                }
                if(!ret)
                hresp.ErrorFind(res, err);

                });

        });



    return router;
};
