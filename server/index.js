const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});

const map = new Map();

const getName = (socket) => {
    return map.get(socket.id);
} 

io.on('connection', (socket) => {
    socket.emit('enter name', {from: 'System', message: 'Please enter your name.'});
    socket.on('enter name', name => {
        map.set(socket.id, name)
        socket.emit('chat message',{from: 'System', message: 'Welcome ' + name + '. Please enter message.'});
        socket.broadcast.emit('chat message', {from: 'System', message: name + ' is entered.'});
    })
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    })
    socket.on('disconnect', () => {
        io.emit('chat message', {from: 'System', message: getName(socket) + ' is leaving.'});
    })
});

server.listen(5000, () => {
    console.log('listening on *:5000');
})