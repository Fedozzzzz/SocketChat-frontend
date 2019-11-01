import React, {Component} from "react"
import "../css/Chat.css"
import VideoChat from "./VideoChat";


class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nickname: this.props.nickname,
            userMsg: "",
            messages: [],
            members: {},
            broadcast: false,
            localVideo: null,
            remoteVideo: [],
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.renderMembersList = this.renderMembersList.bind(this);
        this.onGetMsg = this.onGetMsg.bind(this);
        this.props.socket.on('chat message', (message) => {
            this.onGetMsg(`(${message.date}) ${message.from}: ${message.msg}`)
        });
        this.props.socket.on("news", (data) => {
            this.onGetMsg(data.msg);
        });
        this.props.socket.on("members", (data) => {
            this.setState({members: data});
        });
        this.props.socket.on("disconnect", () => {
            this.props.socket.emit("members");
        })
    }

    componentDidMount() {
        console.log(this.props.chatRoom);
        this.props.socket.emit("join room", this.props.chatRoom.id);
        this.props.socket.emit("members");
    }

    componentWillUnmount() {
        this.props.socket.emit("disconnect");
    }

    onGetMsg(newMessage) {
        let {messages} = this.state;
        messages.push(newMessage);
        this.setState({messages: messages});
        console.log(newMessage);
    }

    onSubmit(e) {
        e.preventDefault();
        const {userMsg, nickname} = this.state;
        if (userMsg) {
            this.props.socket.emit("chat message", {msg: userMsg});
            this.setState({userMsg: ""})
        }
    }

    onFormChange(e) {
        this.setState({userMsg: e.target.value})
    }

    renderMembersList() {
        let result = [];
        const {members} = this.state;
        for (let user in members) {
            result.push(<li className="list-group-item" key={user}>{members[user].nickname}</li>)
        }
        return result;
    }

    render() {
        return (
            <div>
                <div className="chat">
                    <div className="container-fluid justify-content-around">
                        <div className="row">
                            <div className="chat__window col-sm-4">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col">
                                            <h5 className="p-2">Members</h5>
                                        </div>
                                    </div>
                                    <ul className="list-group chat__members">
                                        {this.renderMembersList()}
                                    </ul>
                                </div>
                            </div>
                            <div className="chat__window col-sm-8">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col">
                                            <h5 className="p-2">{this.props.chatRoom.name}</h5>
                                        </div>
                                    </div>
                                    <div className="row d-flex justify-content-center">
                                        <div className="col justify-content-center ">
                                            <ul className="list-group chat__window__message-list">
                                                {this.state.messages.map(msg => (
                                                    <li className="list-group-item text-left">{msg}</li>
                                                ))}
                                            </ul>
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
                            <VideoChat socket={this.props.socket} members={this.state.members}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chat;