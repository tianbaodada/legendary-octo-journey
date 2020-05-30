import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl, Row, Col } from 'react-bootstrap'
import ChatContainer from './ChatContainer';
import {socket} from "../utils/socket";
import moment from 'moment';

export default function ChatPage(props) {
    const [inputVal, setInputVal] = useState('');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([])

    useEffect(() => {
        socket.on('chat message', msg => {
            console.log('on chat message', msg)
            setMessages(oldMessages => [...oldMessages, {message: msg, inbound: true, date: moment()}])
        });
        socket.on('connectSuccess', function(roomId){
            setConnected(true)
            console.log(`A user is connected, ${roomId}`)
        });
        socket.on('chat history', msg => {
            setConnected(true)
            msg.forEach((item) => {
                setMessages(oldMessages => {
                    return [...oldMessages, {message: item.msg, inbound: item.sender === 'him' ? true : false, date: moment(item.date)}]
                })
            })
            console.log(msg);
        });
        socket.on('chat end', function(){
            console.log('chat end')
            setConnected(false);
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
            setMessages(oldMessages => [...oldMessages, {message: inputVal, inbound: false, date: moment()}])
        }
        return false;
    }

    return (
        <div className="vh-100">
            <Row>
                <Col md={4}>
                    <h1 className="serif ml-4" style={{display: 'inline-block'}}>Legendary OCTO Journey</h1>
                </Col>
                <Col md={{ span: 4, offset: 4 }}>
                    <div className="float-right mr-4 mt-2">
                        <Button className="mr-2" variant="danger" onClick={leaveChat}>離開</Button>
                        <Button variant="info" onClick={startChat}>開始</Button>
                    </div>
                </Col>
            </Row>
            <div className="mt-2 mx-4" style={{height: '85%'}}>
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