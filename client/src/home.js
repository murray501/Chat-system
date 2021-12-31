import React, { useState, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { useInput } from "./hooks";
import "./index.css";
import Select from 'react-select';
const dayjs = require('dayjs');

const current = () => {
    return dayjs().format();
}

export default function Home() {
    const [messageProps, resetMessage] = useInput("");
    const [nicknameProps, resetNickname] = useInput("");
    const [messages, setMessage] = useReducer(
        (messages, newMessage) => [newMessage, ...messages],
        []
    );
    const [nickname, setNickname] = useState("");
    const [socket, setSocket] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    const [useroption, setUserOption] = useState();
    const [userList, setUserList] = useState();
    const [avatar, setAvatar] = useState();

    const messageType = () => {
        if (!useroption || useroption.length === 0) {
            return 'public';
        }
        const userlist = (nickname) ? userList.filter(x => x.user !== nickname) : userList

        if (useroption.length === userlist.length) {
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

    const contains = nkname => {
        return userList.map(x => x.user).includes(nkname);
    }

    const submitName = e => {
        e.preventDefault();
        const nkname = nicknameProps.value;
        if (contains(nkname)) {
            setErrorMessage("Name is used. please enter different name.");
            resetNickname();
        } else{
            socket.emit('enter name', nkname);
            setNickname(nkname);
        }
    }

    function UserSelect() {
        const userlist = (nickname) ? userList.filter(x => x.user !== nickname) : userList
        const useroptions = userlist.map(x => {
            return {value: x.user, label: x.user}
        });
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

        socket.on("connect", () => {
            console.log(socket.id);
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
    }, [])

    if (userList === null) {
        return <div>Loading...</div>
    }

    if (!nickname) {
        return (
            <section class="hero is-info is-fullheight">
                <div class="hero-body">
                    <div class="container">
                        <div class="columns">
                            <div class="column">
                                <form onSubmit={submitName} class="box">
                                    <div class="field">
                                        <label class="label">Please enter your name</label>
                                        <input class="input" type="text" {...nicknameProps} placeholder="e.g. Harry Potter" required /> 
                                    </div>
                                    <div class="field">
                                        <button class="button is-success">
                                            Submit
                                        </button>
                                    </div>
                                </form>
                                {
                                    errorMessage ? 
                                        <div class="tag is-warning is-large">{errorMessage}</div> :
                                        <></>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const systemMessages = messages.filter(x => x.from === "System")
    const publicMessages = messages.filter(x => x.from !== "System" && x.type === "public")
    const privateMessages = messages.filter(x => x.from !== "System" && x.type === "private")

    function Notification() {
        if (systemMessages.length > 0) {
            return (
                <article class="message is-primary">
                    <div class="message-header">
                        <p>System Message</p>
                    </div>
                    <div class="message-body">
                        <p>
                            {systemMessages[0].message}
                        </p>
                        <p class="time">{systemMessages[0].time}</p>
                    </div>
                </article>
            )
        } else {
            return <></>
        }
    }

    function Lower() {
        return (
        <div class="columns">
            <div class="column is-5">
                <MessageList messages={publicMessages} nickname={nickname} title="Public" userlist={userList} avatar={avatar}/> 
            </div>
            <div class="column is-5">
                <MessageList messages={privateMessages} nickname={nickname} title="Private" userlist={userList} avatar={avatar}/>    
            </div>
            <div class="column is-2">
                <div class="box">
                    <label class="label">Users</label>
                    <UserList />
                </div>
            </div>
        </div>
        );
    }

    return (
        <div class="container">
            <div class="box">
                <form onSubmit={submit}>
                    <div class="columns is-vcentered">
                        <div class="column is-narrow">
                            <figure class="has-text-centered">
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
            <Lower />
        </div>
    );
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