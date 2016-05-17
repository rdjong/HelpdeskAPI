module.exports = function(router, Category, hresp){

    router.route('/categories')
        .post(function(req, res){
            var category = new Category();
            category.name = req.body.name;

            category.save(function(err){
                if(err){
                    hresp.ErrorSaving(res, err);
                }
                hresp.SuccessSaving(res, category);
            });
        })
        .get(function(req, res){
            Category.find(function(err, categories){
                if(err) {
                    hresp.ErrorFind(res, err);
                }
                hresp.SuccessFind(res, categories);
            });
        });

    router.route('/categories/:id')
        .get(function(req, res) {
          Category.findById(req.params.id, function(err, category){
              if(err) hresp.ErrorFind(res, err);

              hresp.SuccessFind(res, category);
          });
        })
        .put(function(req, res) {
           Category.findById(req.params.id, function(err, category) {
               if(err){
                   hresp.ErrorUpdate(res, err);
                   return;
               }

               category.name = req.body.name;

               category.save(function(err, category) {
                  if(err) {
                      hresp.ErrorSaving(res, err);
                  }
                   hresp.SuccessUpdate(res);
               });
           }) ;
        })
        .delete(function(req, res) {
            Category.remove({
                _id: req.params.id
            }, function(err, categorie){
                if(err){
                    hresp.ErrorDelete(res, err);
                }
                hresp.SuccessDelete(res);
            });
        });


    return router;
};
