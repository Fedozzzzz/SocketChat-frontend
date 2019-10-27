import React, {Component} from 'react';
import './css/App.css';
import Chat from "./components/Chat";
import {openChatSocket} from "./api/socket";
import SignIn from "./components/SignIn";
import ChatRooms from "./components/ChatRooms";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            nickname: "",
            chatRoom: null,
            rooms: null,
            // newChat: null,
        };
        this.socket = openChatSocket();
        this.signInCallback = this.signInCallback.bind(this);
        this.getAllChatRooms = this.getAllChatRooms.bind(this);
        this.getChatRoomCallback = this.getChatRoomCallback.bind(this);
        this.socket.on("news", msg => {
            console.log(msg.msg, msg.roomId)
        });
    }

    signInCallback(data) {
        this.setState({loggedIn: data.loggedIn, nickname: data.nickname});
        console.log("nick:", data);
        this.socket.emit("nickname", data.nickname);
    };

    getAllChatRooms() {
        this.socket.emit("get all rooms");
    }

    getChatRoomCallback(chatRoom) {
        this.setState({chatRoom});
        console.log("room:", chatRoom);
    }

    render() {
        console.log("socket", this.socket);
        console.log("state", this.state);
        const {loggedIn, chatRoom, rooms} = this.state;
        return (
            <div className="App">
                {!loggedIn ? <SignIn signInCallback={this.signInCallback}/> :
                    !chatRoom ?
                        <ChatRooms getChatRoomCallback={this.getChatRoomCallback} rooms={rooms} socket={this.socket}/> :
                        <Chat socket={this.socket} chatRoom={chatRoom} nickname={this.state.nickname}/>}
            </div>
        );
    }
}

export default App;
