import React, {Component} from "react"
import "../css/Chat.css"
import VideoChat from "./VideoChat";

// import {openChatSocket} from "../api/socket";


class Chat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // socket: openChatSocket(),
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
        // this.startBroadcast = this.startBroadcast.bind(this);
        // this.startLocalVideo = this.startLocalVideo.bind(this);
        // this.socket = openChatSocket();
        // this.props.socket.emit("join room", this.props.socket.id);
        // this.socket.emit("nickname", this.props.nickname);
        this.props.socket.on('chat message', (messages) => {
            this.onGetMsg(messages)
        });
        this.props.socket.on("news", (data) => {
            console.log(data);
            this.onGetMsg(data.msg);
        });
        this.props.socket.on("members", (data) => {
            // console.log("members", data);
            this.setState({members: data});
        });
        // this.props.socket.on("room link", (roomId) => {
        //     console.log("room id:", roomId);
        // })
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
        // const tempArr = Array.from(this.state.messages);
        messages.push(newMessage);
        // tempArr.push(messages);
        this.setState({messages: messages});
        console.log(newMessage);
    }

    onSubmit(e) {
        e.preventDefault();
        const {userMsg, nickname} = this.state;
        if (userMsg) {
            this.props.socket.emit("chat message", {msg: userMsg});
            this.setState({userMsg: ""})
            // this.onGetMsg();
        }
    }

    onFormChange(e) {
        this.setState({userMsg: e.target.value})
    }

    // startBroadcast() {
    //     this.setState({broadcast: true});
    //     // this.startLocalVideo();
    // }

    renderMembersList() {
        let result = [];
        const {members} = this.state;
        for (let user in members) {
            // console.log(user);
            result.push(<li className="list-group-item">{members[user].nickname}</li>)
        }
        // this.state.members.forEach((value => {
        //     result.push(<li className="list-group-item">{value.nickname}</li>)
        // }));
        return result;
    }

    render() {
        console.log(this.state);
        console.log(this.props);
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
                                    <div className="row d-flex justify-content-center chat__window__message-list">
                                        <div className="col justify-content-center ">
                                            <ul className="list-group">
                                                {this.state.messages.map(msg => (
                                                    <li key={msg} className="list-group-item text-left">{msg}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="row justify-content-center">
                                        <div className="form-inline col">
                                            <form className="form-group col-sm-6"
                                                  onSubmit={this.onSubmit}>
                                                <input className="form-control col" type="text"
                                                       onChange={this.onFormChange} value={this.state.userMsg}/>
                                            </form>
                                            <button type="button" className="btn btn-primary col-sm-2"
                                                    onClick={this.onSubmit}>Submit
                                            </button>
                                            <button type="button" className="btn btn-outline-info col-sm-4"
                                                    onClick={this.startBroadcast}>Start
                                                broadcast
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*{this.state.broadcast ?*/}
                            {/*<div className="chat__video embed-responsive embed-responsive-4by3">*/}
                            {/*    <video*/}
                            {/*        className="embed-responsive-item"*/}
                            {/*        id="localVideo" autoPlay={true}/>*/}
                            {/*    <video className="embed-responsive-item" id="remoteVideo"/>*/}
                            {/*    /!*<video *!/*/}
                            {/*</div>*/}
                            {/* : null*/}
                            {/*{this.state.broadcast ?*/}
                            <VideoChat socket={this.props.socket} members={this.state.members}/>
                            {/*: null}*/}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chat;


{/*<div>*/
}
{/*    <video id="localVideo" autoPlay={true}/>*/
}
{/*</div>*/
}