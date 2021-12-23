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

const usermap = new Map();

const getName = (socket) => {
    return usermap.get(socket.id);
} 

const current = () => {
    return dayjs().format();
}

io.on('connection', (socket) => {
    socket.emit('user list', {userlist: [...usermap.values()]});
    socket.on('enter name', name => {
        usermap.set(socket.id, name)
        socket.emit('chat message',{from: 'System', message: 'Welcome ' + name + '.', time: current()});
        socket.broadcast.emit('enter', {who: name, time: current()});
    })
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', {...msg, time: current()});
    })
    socket.on('disconnect', () => {
        socket.broadcast.emit('leave', {who: getName(socket), time: current()});
    })
});

server.listen(5000, () => {
    console.log('listening on *:5000');
})