import React, {useState, Component} from 'react';
import './css/App.css';
import Chat from "./components/Chat";
import {openChatSocket} from "./api/socket";
import SignIn from "./components/SignIn";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            nickname: ""
        };
        this.signInCallback = this.signInCallback.bind(this);
    }

    signInCallback(data) {
        this.setState({loggedIn: data.loggedIn, nickname: data.nickname})
    }

    render() {
        const {loggedIn} = this.state;
        return (
            <div className="App">
                {loggedIn ? <Chat nickname={this.state.nickname}/>
                    : <SignIn signInCallback={this.signInCallback}/>}
            </div>
        );
    }

}

export default App;
