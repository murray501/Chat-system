import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";

const reducer = (message, incomingMessage) => [
    incomingMessage,
    ...messages
];

export default function useChatRoom() {
    const [socket, setSocket] = useState();
    const [messages, appendMessage] = useReducer(reducer, []);
    const send = message => socket.emit("message", message);
    
    useEffect(() => {
        const socket = io();
        socket.on("connect", () => console.log("get connection " + socket.id));
        socket.on("message", appendMessage);
        setSocket(socket);
        return () => socket.close()
    }, []);

    return [
        messages,
        send
    ]
}