const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const formatMessage = require('./utils/messages');
const messageService = require('./services/message.service');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
//Configure Mongoose
mongoose.connect('mongodb://localhost:27017/astrochat');
mongoose.set('debug', true);

const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const astroBotName = 'AstroChat Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', async ({username, room}) => {

    let user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //TODO change this to individual user
    socket.emit('message', formatMessage('system', 'Welcome to Astro Chat'));
    //To all the connected users
    socket.broadcast.to(user.room).emit('message', formatMessage('SYSTEM ', `${user.username} user has joined`));
    //To all the users regardless they are connected or not
    //io.emit

    //Get chat history for the room user
    let roomMessages = await messageService.getMessagesForRoom(user.room);

    io.to(user.room).emit('roomMessageHistory', {
      room: user.room,
      messages: roomMessages
    });

    //to individual user
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });

  });

  socket.on('chatMessage', msg => {
    let user = getCurrentUser(socket.id);
    let formattedMessage = formatMessage(user.username, msg);
    //to chat room
    io.to(user.room).emit('message', formattedMessage);
    //to db
    messageService.saveMessage(formattedMessage, user.room);
  });

  socket.on('disconnect', ()=>{
    let user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(user.username, `${user.username} has left`));

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

  });


});

  
const PORT = 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
