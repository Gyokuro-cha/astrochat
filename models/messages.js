
const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username is required']
    },
    text: {
        type: String,
        required: [true, 'message is required']
    },
    room: {
        type: String,
        required: [true, 'room is required']
    },
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Messages', MessageSchema);

