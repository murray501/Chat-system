import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";
import "./index.css";
import ReactList from 'react-list';
import Select from 'react-select';

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [newMessage, ...messages],
        []
    );
    const [useroptions, setUserOptions] = useState([]);
    const [nickname, setNickname] = useState("");
    const [socket, setSocket] = useState();
    const [once, setOnce] = useState(true);

    const submit = e => {
        e.preventDefault();
        const messageObj = {from: nickname, message: messageProps.value};
        socket.emit('chat message', messageObj);
        setMessage(messageObj);
        resetMessage();
    }

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("connect", () => {
            console.log(socket.id);
        })
        socket.on('chat message', msg => {
            setMessage(msg);
        })
        
        socket.on('user list', _userlist => {
            const userlist = _userlist.userlist;
            const initial = [{value: 'all', label: 'all'}];
            const options = userlist.map(x => {
                return {value: x, label: x}
            })
            const options2 = initial.concat(options);
            setUserOptions(options2);

            if (once) {
                setOnce(false);
                let nkname = prompt("please enter your name","Harry Potter");
                
                while (!nkname || userlist.includes(nkname) || nkname === 'all') {
                    nkname = prompt("name is used or empty. please enter other name", "Harry Potter");
                }
                
                socket.emit('enter name', nkname);
                setNickname(nkname);
            }
        }) 
        setSocket(socket);
    }, [])

    if (!nickname) {
        return (
        <p>loading...</p>
        );
    }

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
        <div id="contents">
            <MessageList messages={systemMessages} nickname={nickname}/>
            <MessageList messages={otherMessages} nickname={nickname} />    
            <UserList useroptions={useroptions}/>                    
        </div>
        </>
    )
}

function UserList({useroptions}) {
    return (
        <div id="userList">
            <Select
                defaultValue={useroptions[0]}
                options={useroptions}
            /> 
        </div>
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