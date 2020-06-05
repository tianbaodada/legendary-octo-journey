import React from 'react';

export default function MessageSent(props) {

    const { message, timeStamp } = props;

    const TIME_STAMP_TEMPLATE = '9:12 AM, Today (time stamp example)';

    return (
        <React.Fragment>
            <div className="d-flex justify-content-end">
                <div className="msg_cotainer_send">
                    {message}
                </div>
            </div>
            <span className="d-flex justify-content-end msg_time_send">{timeStamp || TIME_STAMP_TEMPLATE}</span>
        </React.Fragment>
    )
}