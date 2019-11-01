import React, {Component} from "react";
import "../css/ChatRooms.css"


class ChatRooms extends Component {

    constructor(props) {
        super(props);
        this.state = {
            chatRoom: null,
            rooms: new Map(),
        };
        this.setRoom = this.setRoom.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderList = this.renderList.bind(this);
        this.createNewChat = this.createNewChat.bind(this);
        this.props.socket.on("all rooms", data => {
            this.setState({rooms: data});
        });
    }

    componentDidMount() {
        this.props.socket.emit("get all rooms");
    }

    setRoom(e) {
        this.setState({chosenRoom: {name: e.target.innerHTML, id: e.target.id}})
    }

    createNewChat() {
        const roomName = prompt("Enter a room name");
        if (roomName) {
            this.props.socket.emit("create room", roomName);
            this.props.socket.emit("get all rooms");
        }
    }

    onSubmit() {
        const {chosenRoom} = this.state;
        if (chosenRoom) {
            this.props.getChatRoomCallback(chosenRoom);
        } else {
            alert("please, chose chat room");
        }
    }

    renderList() {
        let result = [];
        for (let room in this.state.rooms) {
            result.push(<button onClick={this.setRoom}
                                id={`${room}`}
                                key={room}
                                className="list-group-item list-group-item-action">
                {this.state.rooms[room]}</button>)
        }
        return result;
    }

    render() {
        return (
            <div className="chat-rooms">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <button className="btn btn-primary" onClick={this.createNewChat}>+Create new chat</button>
                        </div>
                    </div>
                    <div className="row list-group ">
                        <div className="col p-0 chat-rooms__rooms">
                            {this.renderList()}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={this.onSubmit}>Submit</button>
                </div>
            </div>)
    }
}

export default ChatRooms;