import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
// import logo from './logo.svg';
import './App.css';
import ChatPage from './views/ChatPage.js'

function App() {
  return (
    <div className="vh-100">
      <ChatPage className="vh-100"/>
    </div>
  );
}

export default App;
