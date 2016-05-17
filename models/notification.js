var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationSchema   = new Schema({
    ChatId: {type: Schema.Types.ObjectId, ref:'Chat', required: false},
    EmployeeID : {type: Schema.Types.ObjectId, ref:'Employee', required: false},
    message: {type: String, required: false}
});

module.exports = mongoose.model('Notification', NotificationSchema);
