import React, { useState } from 'react';

export default function MessageSent(props) {

    const { message, timeStamp } = props;

    const TIME_STAMP_TEMPLATE = '9:12 AM, Today (time stamp example)';

    return (
        <div className="d-flex justify-content-end mb-4">
            <div className="msg_cotainer_send">
                {message}
                <span className="msg_time_send">{timeStamp || TIME_STAMP_TEMPLATE}</span>
            </div>
        </div>
    )
}