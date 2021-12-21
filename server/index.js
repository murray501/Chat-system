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

io.on('connection', (socket) => {
    console.log('a user connected');
    console.log(socket.id);
    socket.on('chat message', msg => {
        console.log('message: ' + msg);
        socket.emit('chat message', "world");
    })
});

server.listen(5000, () => {
    console.log('listening on *:5000');
})