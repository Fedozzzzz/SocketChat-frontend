import React, {Component} from "react"

class ErrorBoundary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null
        }
    }

    componentDidCatch(error, errorInfo) {
        console.log(error);
        this.setState({error, errorInfo})
    }

    render() {
        return this.state.error ? <div><h1>ERROR</h1></div> : this.props.children;
    }
}


export default ErrorBoundary;