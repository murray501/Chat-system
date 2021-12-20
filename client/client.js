const io = require("socket.io-client")

const socket = io("http://localhost:3000")

socket.emit('chat message', 'hello');

socket.on("connect", () => {
  console.log(socket.id)
})

socket.on('chat message', msg => {
  console.log('message: ' + msg);
})