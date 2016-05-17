var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    bcrypt = require('bcrypt-nodejs');

var EmployeeSchema   = new Schema({
    username: {type: String},
    name: {type: String},
    password: {type: String},
    category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
    active: {type:Boolean, default:true}
});

// methods ======================
// generating a hash
EmployeeSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
EmployeeSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Employee', EmployeeSchema);
