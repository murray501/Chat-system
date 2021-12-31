import { useEffect, useState } from 'react'
import Head from 'next/head'
import io from 'socket.io-client'
import useChatRoom from '../components/chatroom'

export default function Index() {
    const [messages, send] = useChatRoom()

    return (
        <>
            <Head>
                <title>Chat system</title>
            </Head>
            <h1>Hello World</h1>
        </>
    )
}