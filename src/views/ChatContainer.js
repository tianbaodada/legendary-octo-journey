import React, { useEffect, useRef } from 'react';
import MessageReceived from '../components/MessageReceived.js'
import MessageSent from '../components/MessageSent.js'
import ChatInfo from './ChatInfo';
import moment from 'moment'

export default function ChatContainer({messages, welcomeMsg, leaveMsg}) {

    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
        });
    });

    return (
        <div 
            className="d-flex flex-column justify-content-end overflow-auto rounded h-100 p-3" 
            style={{backgroundColor: 'rgba(0, 181, 204, 0.2)'}}
        >
            <ChatInfo showMsg={welcomeMsg}/>
            {messages && messages.map(m => {
                const timeStamp = moment(m.date).fromNow();
                return m.inbound ? <MessageReceived message={m.message} timeStamp={timeStamp}/> : <MessageSent message={m.message} timeStamp={timeStamp}/>
            })}
            <ChatInfo showMsg={leaveMsg}/>
            <div ref={messagesEndRef} />
        </div>
    )
}