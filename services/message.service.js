const Messages = require('../models/messages');


let service = {};

service.saveMessage = saveMessage;
service.getMessagesForRoom = getMessagesForRoom;

module.exports = service;


function saveMessage(message, room) {
    
    let newMessage = new Messages({
        'username': message.username,
        'text': message.text,
        'room': room,
        'time': message.date});


        newMessage.save((err, savedNewMessage) => {
        if (err) {
            console.error('Error saving a new message with error =' + err );
        }else {
            console.info('Message is saved');
        }
    });
}

async function getMessagesForRoom(room) {
   let messages =  await Messages.
        find({
            room: room
        })
        .select('_id username text time')
        .exec();

        return messages;
}