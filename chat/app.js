'use strict'
const http = require('http')
const next = require('next')
const Server = require('socket.io')
const dayjs = require('dayjs');
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({dev})

nextApp.prepare().then(
    () => {
        const server = http.createServer(nextApp.getRequestHandler()).listen(3000)
        const io = Server(server)
        processServer(io)
    },
    err => {
        console.log(err)
        process.exit(1)
    }
)

// ----- same as previous content ------

const usermap = new Map();

const getName = (socket) => {
    const obj = usermap.get(socket.id);
    return obj.user;
} 

const getUserList = () => {
    return [...usermap.values()].map(x => {
        return {user: x.user, avatar: x.avatar}
    });
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
                socket.emit('welcome',{avatar: avatar, user: username, time: current()});
                usermap.set(socket.id, {user: username, soc: socket, avatar: avatar});
                socket.broadcast.emit('enter', {who: username, time: current()});
                socket.broadcast.emit('user list update', getUserList());
            }
        })
        .catch(console.error);
}

function processServer(io) {
    io.on('connection', (socket) => {
        socket.emit('user list', getUserList());
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
            socket.broadcast.emit('user list update', getUserList());
        })
    });
}