var mongoose     = require('mongoose');
var idvalidator = require('mongoose-id-validator');
var Schema       = mongoose.Schema;

var FAQSchema   = new Schema({
    question: {type: String, required: true},
    answer: {type: String, required: true},
    category: {type : Schema.Types.ObjectId, ref: 'Category', required: true }
});

FAQSchema.plugin(idvalidator);
module.exports = mongoose.model('FAQ', FAQSchema);
