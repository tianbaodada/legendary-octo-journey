import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap'
import ChatContainer from './ChatContainer';
import {socket} from "../utils/socket";

export default function ChatPage(props) {
    const [inputVal, setInputVal] = useState('');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([])

    let room = '';

    useEffect(() => {
        socket.on('chat message', msg => {
            console.log('on chat message', msg)
            setMessages(oldMessages => [...oldMessages, {message: msg, inbound: true}])
        });
        socket.on('connectSuccess', function(roomId){
            setConnected(true)
            room = roomId;
            console.log(`A user is connected, ${roomId}`)
        });
        socket.on('chat end', function(){
            console.log('chat end')
            if (connected) {
                setConnected(false);
            }
        });
    }, []);

    const startChat = () => {
        if (!connected) {
            socket.emit('chat start');
        }
        console.log('start chat')
    }

    const leaveChat = () => {
        if (connected) {
            setConnected(false);
            socket.emit('chat end');
        }
        console.log('leave chat')
    }

    const sendMessage = () => {
        if (connected) {
            console.log('sending msg', inputVal);
            socket.emit('chat message', inputVal);
            setMessages(oldMessages => [...oldMessages, {message: inputVal, inbound: false}])
        }
        return false;
    }

    return (
        <div className="vh-100">
            <h1 className="serif ml-4" style={{display: 'inline-block'}}>Legendary OCTO Journey</h1>
            <div className="float-right mr-4 mt-2">
                <Button className="mr-2" variant="danger" onClick={leaveChat}>離開</Button>
                <Button variant="info" onClick={startChat}>開始</Button>
            </div>
            <div className="mx-4" style={{height: '85%'}}>
                <ChatContainer messages={messages} />
                <InputGroup className="mb-3" value={inputVal} onChange={(e)=>setInputVal(e.target.value)}>
                    <FormControl/>
                    <InputGroup.Append>
                        <Button variant="outline-secondary" onClick={sendMessage}>送出</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>
        </div>
    )
}