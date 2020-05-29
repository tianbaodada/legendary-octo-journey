import React, { useState } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap'
import ChatContainer from './ChatContainer';

export default function ChatPage(props) {
    const [inputVal, setInputVal] = useState('');

    const startChat = () => {
        console.log('start chat')
    }

    const leaveChat = () => {
        console.log('leave chat')
    }

    return (
        <div className="vh-100">
            <h1 className="serif ml-4" style={{display: 'inline-block'}}>Legendary OCTO Journey</h1>
            <div className="float-right mr-4 mt-2">
                <Button className="mr-2" variant="danger" onClick={leaveChat}>離開</Button>
                <Button variant="info" onClick={startChat}>開始</Button>
            </div>
            <div className="mx-4" style={{height: '85%'}}>
                <ChatContainer/>
                <InputGroup className="mb-3" value={inputVal} onChange={(e)=>setInputVal(e.target.value)}>
                    <FormControl/>
                    <InputGroup.Append>
                        <Button variant="outline-secondary" onClick={()=>console.log(inputVal)}>送出</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>
        </div>
    )
}