import React from 'react';

export default function ChatInfo(props) {
    return (
        <div>
            {props.showMsg && `${props.showMsg}`}
        </div>
    )
}