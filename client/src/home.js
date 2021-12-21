import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [socket, setSocket] = useState();
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [...messages, newMessage],
        []
    );

    const submit = e => {
        e.preventDefault();
        socket.emit('chat message', messageProps.value);
        resetMessage();
    }

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("connect", () => {
            console.log(socket.id);
        })
        socket.on('chat message', msg => {
            console.log('message: ' + msg);
            setMessage(msg);
        })
        setSocket(socket)
    }, [])

    return (
        <>
        <form onSubmit={submit}>
            <input
                {...messageProps}
                type="text"
                placeholder="message..."
                required
            />
            <button>SEND</button>
        </form>
        <ul>
            {messages.map((message, i) => (
                <li>
                    {message}
                </li>
            ))}
        </ul>
        </>
    )
}