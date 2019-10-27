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
        };
        this.socket = openChatSocket();
        this.signInCallback = this.signInCallback.bind(this);
        this.createNewChat = this.createNewChat.bind(this);
        this.getAllChatRooms = this.getAllChatRooms.bind(this);
        this.getChatRoomCallback = this.getChatRoomCallback.bind(this);
        this.socket.on("news", msg => {
            console.log(msg.msg, msg.roomId)
        });
        this.socket.on("all rooms", data => {
            console.log(data);
            // this.setState({rooms: data});
            let tempArr = new Map();
            for (let key in data) {
                if (key !== this.socket.id) {
                    tempArr.set(key, data[key]);
                }
                console.log(key, data[key]);
            }
            this.setState({rooms: tempArr});
            // console.log(data);
        });
    }

    componentDidMount() {
        this.socket.emit("get all rooms");
    }

    signInCallback(data) {
        this.setState({loggedIn: data.loggedIn, nickname: data.nickname})
        console.log("nick:", data);
        this.socket.emit("nickname", data.nickname);
    }

    createNewChat() {
        const roomName = prompt("Enter a room name");
        this.socket.emit("create room", this.socket.id, roomName, "hello");
    }

    getAllChatRooms() {
        this.socket.emit("get all rooms");
    }

    getChatRoomCallback(chatRoom) {
        this.setState({chatRoom})
    }

    render() {
        console.log("socket", this.socket);
        console.log("state", this.state);
        const {loggedIn, chatRoom, rooms} = this.state;
        return (
            <div className="App">
                <button onClick={this.createNewChat}>Create new chat</button>
                <button onClick={this.getAllChatRooms}>Get rooms</button>
                {!loggedIn ? <SignIn signInCallback={this.signInCallback}/> :
                    !chatRoom ? <ChatRooms getChatRoomCallback={this.getChatRoomCallback} rooms={rooms}/> :
                        <Chat socket={this.socket} chatRoom={chatRoom} nickname={this.state.nickname}/>}
            </div>
        );
    }
}

export default App;
