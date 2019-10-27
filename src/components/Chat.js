import React, {Component} from "react"
import "../css/Chat.css"
import {openChatSocket} from "../api/socket";


class Chat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // socket: openChatSocket(),
            nickname: this.props.nickname,
            userMsg: "",
            messages: []
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.onGetMsg = this.onGetMsg.bind(this);
        // this.socket = openChatSocket();
        this.props.socket.emit("join room", this.props.socket.id);
        // this.socket.emit("nickname", this.props.nickname);
        this.props.socket.on('chat message', (messages) => {
            this.onGetMsg(messages)
        });
        this.props.socket.on("news", (data) => {
            console.log(data);
            this.onGetMsg(data.msg);
        })
    }

    componentDidMount() {
        this.props.socket.emit("join room", this.props.chatRoom.id);
    }

    componentWillUnmount() {
        this.props.socket.emit("disconnect");
    }

    onGetMsg(newMessage) {
        let {messages} = this.state;
        // const tempArr = Array.from(this.state.messages);
        messages.push(newMessage);
        // tempArr.push(messages);
        this.setState({messages: messages});
        console.log(newMessage);
    }

    onSubmit(e) {
        e.preventDefault();
        const {userMsg, nickname} = this.state;
        // const {socket} = this.socket;
        // console.log(userMsg);
        if (userMsg) {
            this.props.socket.emit("chat message", {msg: userMsg});
            this.setState({userMsg: ""})
            // this.onGetMsg();
        }
    }

    onFormChange(e) {
        this.setState({userMsg: e.target.value})
    }

    render() {
        console.log(this.state);
        return (<div className="container-fluid">
                <div className="chat">
                    <div className="chat__window">
                        <div className="row chat__window__message-list justify-content-center">
                            <div className="col-sm-10 justify-content-center">
                                <ul className="list-group">
                                    {this.state.messages.map(msg => (
                                        <li key={msg} className="list-group-item">{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="form-inline col">
                            <form className="form-group col-sm-8"
                                  onSubmit={this.onSubmit}>
                                <input className="form-control col" type="text"
                                       onChange={this.onFormChange} value={this.state.userMsg}/>
                            </form>
                            <button type="button" className="btn btn-primary col-sm-4"
                                    onClick={this.onSubmit}>Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chat;