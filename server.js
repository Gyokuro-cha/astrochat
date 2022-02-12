const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const astroBotName = 'AstroChat Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {

    let user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit('message', formatMessage('system', 'Welcome to Astro Chat'));
    //To all the connected users
    socket.broadcast.to(user.room).emit('message', formatMessage('SYSTEM ', `${user.username} user has joined`));
    //To all the users regardless they are connected or not
    //io.emit

    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });

  });

  socket.on('chatMessage', msg => {
    let user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
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
