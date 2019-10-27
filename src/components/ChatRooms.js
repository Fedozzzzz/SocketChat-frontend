import React, {Component} from "react";
import "../css/ChatRooms.css"

class ChatRooms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // chatRoom: false,
            rooms: new Map(),
        };
        this.chosenRoom = this.chosenRoom.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderList = this.renderList.bind(this);
        this.createNewChat = this.createNewChat.bind(this);
        this.props.socket.on("all rooms", data => {
            console.log(data);
            // this.setState({rooms: data});
            let tempArr = new Map();
            for (let key in data) {
                if (key !== this.props.socket.id) {
                    tempArr.set(key, data[key]);
                }
                console.log(key, data[key]);
            }
            this.setState({rooms: tempArr});
            // console.log(data);
        });
    }

    componentDidMount() {
        this.props.socket.emit("get all rooms");
    }

    chosenRoom(e) {
        // console.log(e.target.innerHTML);
        let key = e.target.innerHTML;
        this.setState({chosenRoom: {name: key, data: this.state.rooms.get(e.target.innerHTML)}})
    }

    createNewChat() {
        const roomName = prompt("Enter a room name");
        this.props.socket.emit("create room", this.props.socket.id, roomName, "hello");
        this.props.socket.emit("get all rooms");
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
        this.state.rooms.forEach((value, key) => {
            result.push(<button onClick={this.chosenRoom}
                                className="list-group-item list-group-item-action">
                {value}</button>);
        });
        // this.state.rooms.forEach(value => console.log(value));
        // console.log(result);
        return result;
    }

    render() {
        // console.log("chat rooms:", this.props);
        // console.log("chat room state", this.state);
        return (
            <div className="chat-rooms">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <button className="btn btn-primary" onClick={this.createNewChat}>+Create new chat</button>
                        </div>
                    </div>
                    {/*<button onClick={this.getAllChatRooms}>Get rooms</button>*/}
                    <div className="row list-group chat-rooms__rooms">
                        <div className="col p-0">
                            {this.renderList()}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={this.onSubmit}>Submit</button>
                </div>
            </div>)
    }
}

export default ChatRooms;