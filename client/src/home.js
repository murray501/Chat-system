import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";
import "./index.css";
import ReactList from 'react-list';
import Select from 'react-select';
const dayjs = require('dayjs');

const current = () => {
    return dayjs().format();
}

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [newMessage, ...messages],
        []
    );
    const [useroptions, setUserOptions] = useState([{value: 'all', label: 'all'}]);
    const [nickname, setNickname] = useState("");
    const [socket, setSocket] = useState();
    const [once, setOnce] = useState(true);
    const [useroption, setUserOption] = useState(useroptions[0]);

    const submit = e => {
        e.preventDefault();
        const messageType = (useroption.value === 'all') ? 'public' : 'private';
        const messageObj = (messageType === 'public') ?
            {from: nickname, message: messageProps.value, type: messageType, time: current()}
            : {from: nickname, to: useroption.value, message: messageProps.value, type: messageType, time: current()}  
        socket.emit('chat message', messageObj);
        setMessage(messageObj);
        resetMessage();
    }

    function UserList() {
        return (
            <div id="userList">
                <Select
                    defaultValue={useroption}
                    options={useroptions}
                    onChange={setUserOption}
                /> 
            </div>
        )
    }

    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("connect", () => {
            console.log(socket.id);
        })
        socket.on('chat message', msg => {
            setMessage(msg);
        })
        socket.on('enter', msg => {
            const message= {from: 'System', message: msg.who + " is entered.", time: msg.time};
            setMessage(message);
            console.log("before->" + JSON.stringify(useroptions));
            let newData = [...useroptions];
            newData.push({value: msg.who, label: msg.who});
            console.log("newData = " + JSON.stringify(newData));
            setUserOptions([...newData]);
            console.log(msg.who + " is entered.");
            console.log("after->" + JSON.stringify(useroptions));
        })
        socket.on('leave', msg => {
            const message= {from: 'System', message: msg.who + " is leaving.", time: msg.time}
            setMessage(message);
            let newOptions = useroptions.filter(x => x.value !== msg.who);
            setUserOptions(newOptions);
        })
        socket.on('user list', _userlist => {
            if (once) {
                setOnce(false); 
                const userlist = _userlist.userlist;
                const options = userlist.map(x => {
                    return {value: x, label: x}
                })
                const options2 = useroptions.concat(options);
                setUserOptions(options2);

                let nkname = prompt("please enter your name","Harry Potter");
                
                while (!nkname || userlist.includes(nkname) || nkname === 'all') {
                    nkname = prompt("name is used or empty. please enter other name", "Harry Potter");
                }
                
                if (nkname) {
                    socket.emit('enter name', nkname);
                    setNickname(nkname);
                }
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
    const publicMessages = messages.filter(x => x.from !== "System" && x.type === "public")
    const privateMessages = messages.filter(x => x.from !== "System" && x.type === "private")

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
            <MessageList messages={systemMessages} nickname={nickname} title="System"/>
            <MessageList messages={publicMessages} nickname={nickname} title="Public"/> 
            <MessageList messages={privateMessages} nickname={nickname} title="Private"/>     
            <UserList />                    
        </div>
        </>
    )
}

function MessageList({messages, nickname, title}) {
    const privateMessage = (msg) => {
        const content =
        msg.from === nickname ?
        `[To: ${msg.to}] ${msg.message}` :
        `[From: ${msg.from}] ${msg.message}`;
        return content;
    }

    const renderItem = (index, key) => {
        let attribute = messages[index].from === nickname ? ' me' : (index % 2 ? '' : ' even')
        attribute = index === 0 ? ' top' : attribute
        let content = messages[index].from !== 'System' && messages[index].type === 'private' ?
            privateMessage(messages[index]) :
            `[${messages[index].from}] ${messages[index].message}`

        return( 
        <div key={key} class= {"listitem" + attribute}>
            {content} 
            <div class="time">
                {messages[index].time}
            </div>
        </div>
        )
    }

    return (
        <div>
            <div>{title}</div>
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