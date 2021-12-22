const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const dayjs = require('dayjs')

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});

const map = new Map();

const getName = (socket) => {
    return map.get(socket.id);
} 

const current = () => {
    return dayjs().format();
}

io.on('connection', (socket) => {
    socket.emit('enter name', {from: 'System', message: 'Please enter your name.', time: current()});
    socket.on('enter name', name => {
        map.set(socket.id, name)
        socket.emit('chat message',{from: 'System', message: 'Welcome ' + name + '. Please enter message.', time: current()});
        socket.broadcast.emit('chat message', {from: 'System', message: name + ' is entered.', time: current()});
    })
    socket.on('chat message', (msg) => {
        io.emit('chat message', {...msg, time: current()});
    })
    socket.on('disconnect', () => {
        io.emit('chat message', {from: 'System', message: getName(socket) + ' is leaving.', time: current()});
    })
});

server.listen(5000, () => {
    console.log('listening on *:5000');
})