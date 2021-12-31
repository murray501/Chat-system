'use strict'
const http = require('http')
const next = require('next')
const Server = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({dev})

nextApp.prepare().then(
    () => {
        const server = http.createServer(nextApp.getRequestHandler()).listen(3000)
        const io = Server(server)

        io.on('connection', (socket) => {
            console.log("connected");
            socket.on('disconnect', () => {
                console.log("disconnected");
            })
        })
    },
    err => {
        console.log(err)
        process.exit(1)
    }
)