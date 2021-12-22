import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";
import "./index.css";
import ReactList from 'react-list';

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [socket, setSocket] = useState();
    const [first, setFirst] = useState(true);
    const [nickname, setNickname] = useState("");
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [newMessage, ...messages],
        []
    );

    const submit = e => {
        e.preventDefault();
        if (first) {
            socket.emit('enter name', messageProps.value);
            setNickname(messageProps.value);
            setFirst(false);  
        } else {
            socket.emit('chat message', {from: nickname, message: messageProps.value});
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

    const systemMessages = messages.filter(x => x.from === "System")
    const otherMessages = messages.filter(x => x.from !== "System")

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
        <div style={{display: "flex"}}>
            <MessageList messages={otherMessages} nickname={nickname}/>
            <MessageList messages={systemMessages} nickname={nickname} />
        </div>
        </>
    )
}

function MessageList({messages, nickname}) {
    const renderItem = (index, key) => {
        let attribute = messages[index].from === nickname ? ' me' : (index % 2 ? '' : ' even')
        attribute = index === 0 ? ' top' : attribute
        return( 
        <div key={key} class= {"listitem" + attribute}>
            [{messages[index].from}] {messages[index].message} 
            <div class="time">
                {messages[index].time}
            </div>
        </div>
        )
    }

    return (
        <div>
            <div id="messageList" style={{overflow: 'auto', maxHeight: 400}}>
                <ReactList
                    itemRenderer={renderItem}
                    length={messages.length}
                    type='uniform'
                />
            </div>
        </div>
    )
}