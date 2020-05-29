import React, { useState } from 'react';
import { Container } from 'react-bootstrap'
import MessageReceived from '../components/MessageReceived.js'
import MessageSent from '../components/MessageSent.js'

export default function ChatContainer(props) {

    return (
        <div className="rounded h-100 p-3" style={{backgroundColor: 'rgba(0, 181, 204, 0.2)'}}>
            <MessageReceived message='yoyoyo'/>
            <MessageSent message='whut'/>
        </div>
    )
}