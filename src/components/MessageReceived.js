import React from 'react';

export default function MessageReceived(props) {

    const { message, timeStamp } = props;

    const TIME_STAMP_TEMPLATE = '9:12 AM, Today (time stamp example)';

    return (
        <React.Fragment>
            <div className="d-flex justify-content-start">
                <div className="msg_cotainer">
                    {message}
                </div>
            </div>
            <span className="d-flex justify-content-start msg_time_send">{timeStamp || TIME_STAMP_TEMPLATE}</span>
        </React.Fragment>
    )
}