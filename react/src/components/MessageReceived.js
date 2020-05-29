import React, { useState } from 'react';

export default function MessageReceived(props) {

    const { message, timeStamp } = props;

    const TIME_STAMP_TEMPLATE = '9:12 AM, Today (time stamp example)';

    return (
        <div className="d-flex justify-content-start mb-4">
            <div className="msg_cotainer">
                {message}
                <span className="msg_time">{timeStamp || TIME_STAMP_TEMPLATE}</span>
            </div>
        </div>
    )
}