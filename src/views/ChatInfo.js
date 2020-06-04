import React from 'react';

export default function ChatInfo(props) {
    return (
        <div className="align-self-center">
                {props.showMsg && `${props.showMsg}`}
        </div>
    )
}