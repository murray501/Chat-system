const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const dayjs = require('dayjs')
require('isomorphic-fetch');

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

const getImage = (socket, username) => {
    fetch('https://dog.ceo/api/breeds/image/random')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const avatar = data.message;
                socket.emit('welcome',{avatar: avatar, time: current()});
                usermap.set(socket.id, {user: username, soc: socket, avatar: avatar});
                socket.broadcast.emit('enter', {who: username, time: current()});
                socket.broadcast.emit('user list update', {userlist: getUserList()});
            }
        })
        .catch(console.error);
}

io.on('connection', (socket) => {
    socket.emit('user list', {userlist: getUserList()});
    socket.on('enter name', username => {
        getImage(socket, username);
    })
    socket.on('chat message', (msg) => {
        if (msg.type === 'public') {
            socket.broadcast.emit('chat message', msg);
        } else {
            msg.to.forEach(username => {
                const target = getSocket(username);
                if (target) {
                    target.emit('chat message', msg);
                }
            })
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