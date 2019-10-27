import React, {Component} from "react"
import "../css/SignIn.css"

class SignIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nickname: ""
        };
        this.handleInput = this.handleInput.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleInput(e) {
        this.setState({nickname: e.target.value});
    }

    onSubmit() {
        this.props.signInCallback({nickname: this.state.nickname, loggedIn: true})
    }

    render() {
        return (
            <div className="sign-in sign-in__row">
                <div className="container-fluid">
                    <div className="row align-items-center ">
                        <div className="col">
                            <div className="form-inline justify-content-center" onSubmit={this.onSubmit}>
                                <form className="form-group">
                                    <label htmlFor="nickname">Enter nickname</label>
                                    <input className="form-control" type="text" id="nickname"
                                           onChange={this.handleInput}/>
                                </form>
                                <button className="btn btn-success" onClick={this.onSubmit}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)
    }
}

export default SignIn;