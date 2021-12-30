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

    function UserSelect() {
        const userlist = (nickname) ? 
        userList.filter(x => x.user !== nickname) : userList
    
        return (
                <Select
                    isMulti
                    defaultValue={useroption}
                    options={useroptions}
                    onChange={setUserOption}
                /> 
        )
    }

    function UserList() {
        const userlist = (nickname) ? 
            userList.filter(x => x.user !== nickname) : userList
        return (
            <>
                {userlist.map(x => {
                    return (
                        <figure>
                            <label class="label">{x.user}</label>
                            <img src={x.avatar} width="100" height="auto" />
                        </figure>
                    )
                })}
            </>           
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

    function Notification() {
        if (systemMessages.length > 0) {
            return (
                <div class="box">
                    <label class="label">System Message</label>
                    <p>
                    {systemMessages[0].message}
                    </p>
                    <p class="time">{systemMessages[0].time}</p>
                </div>
            )
        } else {
            return <></>
        }
    }

    return (
        <>
        <div class="box">
            <form onSubmit={submit}>
                <div class="columns">
                    <div class="column is-narrow">
                        <figure>
                            <label class="label">{nickname}</label>
                            <img src={avatar} width="100" height="auto"/>
                        </figure>
                    </div>     
                    <div class="column">
                        <label class="label">Write Message.</label>
                        <textarea class="textarea" autocomplete="off" {...messageProps} placeholder="message..." required />
                    </div>
                    <div class="column is-2">
                        <div class="field">
                            <label class="label">Select Receivers.</label>
                            <UserSelect />
                        </div>
                        <div class="field">
                            <button class="button is-primary is-light">Send</button>
                        </div>
                    </div>
                    <div class="colum is-2">
                        <Notification />
                    </div>
                </div>
            </form>
        </div>
        <div class="columns">
            <div class="column is-5">
                <MessageList messages={publicMessages} nickname={nickname} title="Public" userlist={userList} avatar={avatar}/> 
            </div>
            <div class="column is-5">
                <MessageList messages={privateMessages} nickname={nickname} title="Private" userlist={userList} avatar={avatar}/>    
            </div>
            <div class="column is-2">
                <label class="label">Users</label>
                <UserList />
            </div>
        </div>
        </>
    )
}

function MessageList({messages, nickname, title, userlist, avatar}) {

    const getImage = (user) => {
        if (user === nickname) {
            return avatar;
        }
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
                <>
                {msg.message}
                <div class="time">{msg.time}</div>
                </>
            );
        } else if (msg.type === 'public') {
            const image = getImage(msg.from); 
            return (
                <article class="media">
                    <figure class="media-left">
                        <p class="image is-32x32">
                            <img src={image} />
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{msg.from}</strong> <span class="time">{msg.time}</span>
                                <br/>
                                {msg.message}
                            </p>
                        </div>
                    </div>
                </article>
            );
        } else {
            const image = msg.from === nickname ? '' : getImage(msg.from);
            const content = msg.from === nickname ? 
            `[To: ${msg.to}] ${msg.message}` :  `${msg.message}`;
            return (
                <article class="media">
                    {image !== '' ? 
                    (<figure class="media-left">
                        <p class="image is-32x32">
                            <img src={image} />
                        </p>
                    </figure>) : 
                    null
                    }
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{msg.from}</strong> <span class="time">{msg.time}</span>
                                <br/>
                                {content}
                            </p>
                        </div>
                    </div>
                </article> 
            );
        }
    }

    return (
        <div class="box">
            <label class="label">{title}</label>
            {
                messages.map((msg, index) => {
                    return (<Content index={index} />)
                })
            }
        </div>
    )
}