import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

localStorage.debug = 'socket.io-client:socket';

export default function Home() {
    const [socket, setSocket] = useState();

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.emit('chat message', 'hello');
        socket.on("connect", () => {
            console.log(socket.id)
        })
        socket.on('chat message', msg => {
            console.log('message: ' + msg);
        })
    }, [])

    return (
        <h1>Hello World</h1>
    )
}