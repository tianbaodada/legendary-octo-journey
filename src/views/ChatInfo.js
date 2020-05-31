import React, { useState, useEffect } from 'react';

export default function ChatInfo(props) {
    return (
        <div style={{ display: "block" }} >
            {props.showMsg && `${props.showMsg}`}
        </div>
    )
}