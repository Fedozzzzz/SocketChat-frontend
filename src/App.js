import React, {Component} from 'react';
import './css/App.css';
import Chat from "./components/Chat";
import {openChatSocket} from "./api/socket";
import SignIn from "./components/SignIn";
import ChatRooms from "./components/ChatRooms";
import ErrorBoundary from "./components/ErrorBoundary";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            nickname: "",
            chatRoom: null,
            rooms: null,
        };
        this.socket = openChatSocket();
        this.signInCallback = this.signInCallback.bind(this);
        this.getAllChatRooms = this.getAllChatRooms.bind(this);
        this.getChatRoomCallback = this.getChatRoomCallback.bind(this);
    }

    signInCallback(data) {
        this.setState({loggedIn: data.loggedIn, nickname: data.nickname});
        this.socket.emit("nickname", data.nickname);
    };

    getAllChatRooms() {
        this.socket.emit("get all rooms");
    }

    getChatRoomCallback(chatRoom) {
        this.setState({chatRoom});
    }

    render() {
        const {loggedIn, chatRoom, rooms} = this.state;
        return (
            <ErrorBoundary>
                <div className="App">
                    {!loggedIn ? <SignIn signInCallback={this.signInCallback}/> :
                        !chatRoom ?
                            <ChatRooms getChatRoomCallback={this.getChatRoomCallback} rooms={rooms}
                                       socket={this.socket}/> :
                            <Chat socket={this.socket} chatRoom={chatRoom} nickname={this.state.nickname}/>}
                </div>
            </ErrorBoundary>
        );
    }
}

export default App;
