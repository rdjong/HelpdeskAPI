var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FileSchema   = new Schema({
    base: {type: String, required: true}
});

module.exports = mongoose.model('File', FileSchema);
