import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
import ChatContainer from './ChatContainer';
import {socket} from "../utils/socket";
import moment from 'moment';

export default function ChatPage(props) {
    const [inputVal, setInputVal] = useState('');
    const [info, setInfo] = useState({ welcomeMsg: '請按下開始', leaveMsg: '' });
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [key, setKey] = useState('');

    useEffect(() => {
        socket.on('chat message', msg => setMessages(oldMessages => [...oldMessages, {message: msg, inbound: true, date: moment()}]));
        socket.on('connectSuccess', () => {
            setConnected(true)
            setInfo({ welcomeMsg: '連線成功, 請開始你的表演', leaveMsg: '' });
        });
        socket.on('chat history', msg => {
            setConnected(true);
            setInfo({ welcomeMsg: '連線成功, 請開始你的表演', leaveMsg: '' });
            setMessages([]);
            msg.forEach(item => setMessages(oldMessages => [...oldMessages, {message: item.msg, inbound: item.inbound, date: moment(item.date)}]));
        });
        socket.on('chat end', () => {
            setInfo({ welcomeMsg: '', leaveMsg: '對方離開了, 請按下開始' });
            setConnected(false);
        });
    }, []);

    const startChat = () => {
        if (!connected) {
            setMessages([]);
            setInfo({ welcomeMsg: '連線中', leaveMsg: '' });
            socket.emit('chat start');
        }
    }

    const leaveChat = () => {
        if (connected) {
            setConnected(false);
            setMessages([]);
            setInfo({ welcomeMsg: '', leaveMsg: '已離開, 請按下開始' });
            socket.emit('chat end');
        }
    }

    const sendMessage = () => {
        if (connected) {
            if (inputVal !== ''){
                socket.emit('chat message', inputVal);
                setMessages(oldMessages => [...oldMessages, {message: inputVal, inbound: false, date: moment()}]);
            }
            setInputVal('');
            setKey(Math.random()); // work around to clear input content after submit
        }
        return false;
    }

    return (
        <div className="vh-100">
            <Row className="fixed-top" style={{top: '10px'}}>
                <Col md={4} sm={4} xs={4}>
                    <h1 className="serif ml-4" style={{display: 'inline-block'}}>BONBON</h1>
                </Col>
                <Col md={{ span: 4, offset: 4 }} sm={{ span: 4, offset: 4 }} xs={8}>
                    <div className="float-right mr-4 mt-2">
                        <Button className="mr-2" variant="danger" onClick={leaveChat}>離開</Button>
                        <Button variant="info" onClick={startChat}>開始</Button>
                    </div>
                </Col>
            </Row>
            <div className="mt-2 mx-4 fixed-bottom" style={{ height: '77%', bottom: '70px' }}>
                <ChatContainer messages={messages} info={info}/>
                <InputGroup className="mb-3" value={inputVal} onChange={(e) => setInputVal(e.target.value.trim())} key={key}>
                    <FormControl />
                    <InputGroup.Append>
                        <Button variant="outline-secondary" onClick={sendMessage}>送出</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>
        </div>
    )
}