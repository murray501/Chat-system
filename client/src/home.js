import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";
import "./index.css";

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [socket, setSocket] = useState();
    const [first, setFirst] = useState(true);
    const [name, setName] = useState("");
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [...messages, newMessage],
        []
    );

    const submit = e => {
        e.preventDefault();
        if (first) {
            socket.emit('enter name', messageProps.value);
            setName(messageProps.value);
            setFirst(false);  
        } else {
            socket.emit('chat message', {from: name, message: messageProps.value});
        }
        resetMessage();
    }

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("connect", () => {
            console.log(socket.id);
        })
        socket.on('enter name', msg => {
            setMessage(msg);
        })
        socket.on('chat message', msg => {
            setMessage(msg);
        })
        setSocket(socket)
    }, [])

    return (
        <>
        <form id="form" onSubmit={submit}>
            <input id="input" autocomplete="off"
                {...messageProps}
                type="text"
                placeholder="message..."
                required
            />
            <button>Send</button>
        </form>
        <ul id="messages">
            {messages.map(({from, message}, i) => (
                <li>
                    [{from}] {message}
                </li>
            ))}
        </ul>
        </>
    )
}