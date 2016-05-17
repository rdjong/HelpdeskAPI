//TODO add require constraints in the schema
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChatSchema   = new Schema({
    customer : {type: Schema.Types.ObjectId, ref: 'Customer'},
    employees : [{type: Schema.Types.ObjectId, ref: 'Employee'}],
    category : {type : Schema.Types.ObjectId, ref: 'Category'},
    updated_at: {type: Date, default: Date.now},
    solved: {type: Boolean, default: false},
    messages : [{
        user : {type: Schema.Types.ObjectId, ref:'Customer', required: false, default: null},
        employee: {type: Schema.Types.ObjectId, ref: 'Employee', required: false, default: null},
        isEmployee : {type : Boolean},
        isNewMessage : {type: Boolean},
        text : {type: String},
        timeStamp : {type: Date, default: Date.now},
        system: {type: Boolean, default: false}
    }],
    files : [{type: Schema.Types.ObjectId, ref: 'File'}]
});

module.exports = mongoose.model('Chat', ChatSchema);
