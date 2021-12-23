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
    const obj = usermap.get(socket.id);
    return obj.user;
} 

const getUserList = () => {
    return [...usermap.values()].map(x => x.user);
}

const getSocket = (username) => {
    const target = [...usermap.values()].find(x => x.user === username);
    if (target) {
        return target.soc;
    }
}

const current = () => {
    return dayjs().format();
}

io.on('connection', (socket) => {
    socket.emit('user list', {userlist: getUserList()});
    socket.on('enter name', name => {
        usermap.set(socket.id, {user: name, soc: socket});
        socket.emit('chat message',{from: 'System', message: 'Welcome ' + name + '.', time: current()});
        socket.broadcast.emit('enter', {who: name, time: current()});
        socket.broadcast.emit('user list update', {userlist: getUserList()});
    })
    socket.on('chat message', (msg) => {
        if (msg.type === 'public') {
            socket.broadcast.emit('chat message', msg);
        } else {
            const target = getSocket(msg.to);
            if (target) {
                target.emit('chat message', msg);
            }
        }
    })
    socket.on('disconnect', () => {
        const who = getName(socket);
        usermap.delete(socket.id);
        socket.broadcast.emit('leave', {who: who, time: current()});
        socket.broadcast.emit('user list update', {userlist: getUserList()});
    })
});

server.listen(5000, () => {
    console.log('listening on *:5000');
})