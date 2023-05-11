import { Component } from "react";
import Error from "../components/alert.component.jsx";
import { debug } from "../services/functions";
import messages from "../services/messages";

class ErrorBoundary extends Component {
    state = {
        error: false,
        errorInf: null
    }

    componentDidCatch(error, errorInfo){
        debug(error);
        debug(errorInfo);
        this.setState({error: true, errorInf: error.message});
    }

    render() {
        if(this.state.error){
            return <Error type="danger" messages={[(this.state.errorInf ? this.state.errorInf: messages.ERROR)]}/>
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
