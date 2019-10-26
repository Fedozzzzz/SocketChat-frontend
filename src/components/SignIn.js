import React, {Component} from "react"

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
        return (<div className="container-fluid">
            <div className="row justify-content-center">
                <div className="form-inline" onSubmit={this.onSubmit}>
                    <form className="form-group">
                        <label htmlFor="nickname">Enter nickname</label>
                        <input className="form-control" type="text" id="nickname" onChange={this.handleInput}/>
                    </form>
                    <button className="btn btn-success" onClick={this.onSubmit}>OK</button>
                </div>
            </div>
        </div>)
    }
}

export default SignIn;