var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CustomerSchema   = new Schema({
    name: {type: String, required: true},
    registrationId : {type: String},
    os : {type: String},
    active: {type:Boolean, default:true}
});

module.exports = mongoose.model('Customer', CustomerSchema);
