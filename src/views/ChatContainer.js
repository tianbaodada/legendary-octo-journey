import React, { useEffect, useRef } from 'react';
import MessageReceived from '../components/MessageReceived.js'
import MessageSent from '../components/MessageSent.js'
import ChatInfo from './ChatInfo';
import moment from 'moment'

export default function ChatContainer({messages, info}) {

    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
        });
    });

    return (
        <div 
            className="overflow-auto rounded h-100 p-3" 
            style={{backgroundColor: 'rgba(0, 181, 204, 0.2)'}}
        >
            <ChatInfo showMsg={info.welcomeMsg} />
            {messages && messages.map(m => {
                const timeStamp = moment(m.date).fromNow();
                return m.inbound ? <MessageReceived message={m.message} timeStamp={timeStamp} /> : <MessageSent message={m.message} timeStamp={timeStamp} />
            })}
            <ChatInfo showMsg={info.leaveMsg} />
            <div ref={messagesEndRef} />
        </div>
    )
}