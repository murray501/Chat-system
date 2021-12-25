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
    const [useroptions, setUserOptions] = useState([]);
    const [nickname, setNickname] = useState("");
    const [socket, setSocket] = useState();
    const [once, setOnce] = useState(true);
    const [useroption, setUserOption] = useState();
    const [userList, setUserList] = useState();
    const [avatar, setAvatar] = useState();

    const messageType = () => {
        if (!useroptions || !useroption) {
            return 'public';
        }
        if (useroption.length === 0 || useroption.length === useroptions.length) {
            return 'public';
        }
        return 'private';
    }

    const submit = e => {
        e.preventDefault();
        const type = messageType();
        const multiTo = useroption?.map(x => x.value); 
        const messageObj = (type === 'public') ?
            {from: nickname, message: messageProps.value, type: type, time: current()}
            : {from: nickname, to: multiTo, message: messageProps.value, type: type, time: current()}  
        socket.emit('chat message', messageObj);
        setMessage(messageObj);
        resetMessage();
    }

    function UserList() {
        return (
            <div id="userList">
                <Select
                    isMulti
                    defaultValue={useroption}
                    options={useroptions}
                    onChange={setUserOption}
                /> 
            </div>
        )
    }

    useEffect(() => {
        const socket = io("http://localhost:5000");
        let nkname;

        const setuserlist = userlist => {
            let options = userlist.map(x => {
                return {value: x.user, label: x.user}
            })
            if (nkname) {
                options = options.filter(x => x.value !== nkname);
            }
            setUserOptions(options);
            setUserList(userlist);
        }

        const contains = userlist => {
            return userlist.map(x => x.user).includes(nkname);
        }

        socket.on("connect", () => {
            console.log(socket.id);
        })
        socket.on('chat message', msg => {
            setMessage(msg);
        })
        socket.on('welcome', msg => {
            const message = {from: 'System', message: `Welcome! ${nkname}.`, time: msg.time};
            setMessage(message);
            setAvatar(msg.avatar);
            console.log("avatar = " + msg.avatar);
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
            setuserlist(userlist);
        })
        socket.on('user list', userlist => {
            if (once) {
                setOnce(false);

                setuserlist(userlist);
    
                nkname = prompt("please enter your name","Harry Potter");
                
                while (!nkname || contains(userlist) || nkname === 'all') {
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
            <MessageList messages={systemMessages} nickname={nickname} title="System" userlist={userList} avatar={avatar}/>
            <MessageList messages={publicMessages} nickname={nickname} title="Public" userlist={userList} avatar={avatar}/> 
            <MessageList messages={privateMessages} nickname={nickname} title="Private" userlist={userList} avatar={avatar}/>
            <div>
                <UserList />
                <div id="profile">
                    <div>{nickname}</div>
                    <div>
                        <img src={avatar} width="100" height="auto"/>
                    </div>
                </div>
            </div>                     
        </div>
        </>
    )
}

function MessageList({messages, nickname, title, userlist, avatar}) {
    const privateMessage = (msg) => {
        const content =
        msg.from === nickname ?
        `[To: ${msg.to}] ${msg.message}` :
        `[From: ${msg.from}] ${msg.message}`;
        return content;
    }

    const attribute = (index) => {
        const msg = messages[index];
        let attr = msg.from === nickname ? ' me' : (index % 2 ? '' : ' even')
        attr = index === 0 ? ' top' : attr
        return attr;
    } 

    const getImage = (user) => {
        const target = userlist.find(x => x.user === user);
        if (target) {
            return target.avatar;
        } else {
            return '';
        }
    }

    function Content({index}) {
        const msg = messages[index];
        if (msg.from === 'System') {
            return (
                <div>
                    <p>{msg.message}</p>
                    <p class="time">{msg.time}</p>
                </div>
            );
        } else if (msg.type === 'public') {
            const image = (msg.from === nickname) ? avatar : getImage(msg.from); 
            return (
                <div style={{display: "flex"}}>
                    <div class="list-image">
                        <img src={image} width="auto" height="50" />
                    </div>
                    <div style={{flex: 1}}>
                        <p>
                            [{msg.from}] {msg.message}
                        </p>
                        <p class="time">
                            {msg.time}
                        </p>
                    </div>
                </div>
            );
        }
        return (
            <h1></h1>
        );
    }

    const renderItem = (index, key) => {
        let content = messages[index].from !== 'System' && messages[index].type === 'private' ?
            privateMessage(messages[index]) :
            `[${messages[index].from}] ${messages[index].message}`

        return( 
        <div key={key} class= {"listitem" + attribute(index)}>
            <Content index={index} /> 
        </div>
        )
    }

    return (
        <div>
            <div class='title'>{title}</div>
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