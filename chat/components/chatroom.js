import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";

const reducer = (messages, incomingMessage) => [
    incomingMessage,
    ...messages
];

export function useChatRoom() {
    const [socket, setSocket] = useState();
    const [messages, setMessage] = useReducer(reducer, []);
    const [avatar, setAvatar] = useState();
    const [userList, setUserList] = useState([]);

    const send = (eventName, message) => socket.emit(eventName, message);
    
    useEffect(() => {
        const socket = io();

        socket.on("connect", () => {
            console.log("socket connected. " + socket.id);
        })
        socket.on('chat message', msg => {
            setMessage(msg);
        })
        socket.on('welcome', msg => {
            const message = {from: 'System', message: `Welcome! ${msg.user}.`, time: msg.time};
            setMessage(message);
            setAvatar(msg.avatar);
        })
        socket.on('enter', msg => {
            const message= {from: 'System', message: msg.who + " is entered.", time: msg.time};
            setMessage(message);
        })
        socket.on('leave', msg => {
            const message= {from: 'System', message: msg.who + " is leaving.", time: msg.time}
            setMessage(message);
        })
        socket.on('user list update', userlist => {
            setUserList([...userlist]);
        })
        socket.on('user list', userlist => {
            setUserList(userlist);
        })

        setSocket(socket);
        return () => socket.close()
    }, []);

    return [
        messages,
        avatar,
        userList,
        send,
        setMessage,
    ]
}

export const useInput = initialValue => {
    const [value, setValue] = useState(initialValue);
    return [
        {value, onChange: e => setValue(e.target.value) },
        () => setValue(initialValue)
    ];
}