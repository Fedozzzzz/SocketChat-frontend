import React, {Component} from "react";


class ChatRooms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // chatRoom: false,
        };
        this.chosenRoom = this.chosenRoom.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderList = this.renderList.bind(this);
    }

    chosenRoom(e) {
        // console.log(e.target.innerHTML);
        let key = e.target.innerHTML;
        this.setState({chosenRoom: {id: key, data: this.props.rooms.get(e.target.innerHTML)}})
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
        this.props.rooms.forEach((value, key) => {
            result.push(<button onClick={this.chosenRoom}
                                className="list-group-item list-group-item-action">
                {value}</button>);
        });
        // this.props.rooms.forEach(value => console.log(value));
        // console.log(result);
        return result;
    }

    render() {
        console.log("chat rooms:", this.props);
        console.log("chat room state", this.state);
        return (<div>
            <div className="list-group">
                {this.renderList()}
            </div>
            <button className="btn btn-primary" onClick={this.onSubmit}>Submit</button>
        </div>)
    }
}

export default ChatRooms;