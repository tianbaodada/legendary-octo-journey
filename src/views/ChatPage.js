import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl, Row, Col } from 'react-bootstrap'
import ChatContainer from './ChatContainer';
import ChatInfo from './ChatInfo';
import {socket} from "../utils/socket";
import moment from 'moment';

export default function ChatPage(props) {
    const [inputVal, setInputVal] = useState('');
    const [info, setInfo] = useState('請按下開始');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([])

    useEffect(() => {
        socket.on('chat message', msg => {
            console.log('on chat message', msg)
            setMessages(oldMessages => [...oldMessages, {message: msg, inbound: true, date: moment()}])
        });
        socket.on('connectSuccess', function(){
            setConnected(true)
            setInfo('連線成功, 請開始你的表演');
            setTimeout(() => {
                setInfo('');
            }, 3000);
            console.log(`A user is connected`)
        });
        socket.on('chat history', msg => {
            setConnected(true)
            setInfo('');
            msg.forEach((item) => {
                setMessages(oldMessages => {
                    return [...oldMessages, {message: item.msg, inbound: item.inbound, date: moment(item.date)}]
                })
            })
            console.log(msg);
        });
        socket.on('chat end', function(){
            console.log('chat end')
            setInfo('對方離開了, 請按下開始');
            setConnected(false);
        });
    }, []);

    const startChat = () => {
        if (!connected) {
            setMessages([]);
            setInfo('連線中');
            socket.emit('chat start');
        }
        console.log('start chat')
    }

    const leaveChat = () => {
        if (connected) {
            setConnected(false);
            setMessages([]);
            setInfo('已離開, 請按下開始');
            socket.emit('chat end');
        }
        console.log('leave chat')
    }

    const sendMessage = () => {
        if (connected) {
            if (inputVal !== ''){
                console.log('sending msg', inputVal);
                socket.emit('chat message', inputVal);
                setMessages(oldMessages => [...oldMessages, {message: inputVal, inbound: false, date: moment()}])
            }
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
                <ChatInfo showMsg={info}/>
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