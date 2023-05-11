import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

import messages from "../services/messages";
import Alert from "./alert.component.jsx";
import config from "../services/config";

import { withRouter } from '../common/with-router.jsx';

const required = value => {
    if (!value) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.FIELD_REQUIRED}
                </p>
            </div>
        );
    }
};

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.handleFP = this.handleFP.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);

        this.state = {
            username: "",
            loading: false,
            message: ""
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    goTo(){
        this.props.router.navigate(`${config._install_path}`);
        window.location.reload();
    }

    handleFP(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.sendPassword(this.state.username).then(
                (response) => {
                    this.setState({
                        loading: false,
                        message: "Пароль выслан на email"
                    });
                },
                error => {
                    this.setState({
                        loading: false,
                        message: "Пароль выслан на email"
                    });
                }
            );
        } else {
            this.setState({
                loading: false
            });
        }
    }

    goToAuth = () => {
        this.props.router.navigate(`${config._install_path}login`);
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="card card-container">
                    <header className="jumbotron">
                        <h3>Запросить новый пароль</h3>
                    </header>
                    <Form
                        onSubmit={this.handleFP}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor="username">Email</label>
                            <Input
                                type="text"
                                className="form-control"
                                name="username"
                                value={this.state.username}
                                onChange={this.onChangeUsername}
                                validations={[required]}
                            />
                        </div>

                        <div className="form-group mt-3">
                            <button
                                className="btn btn-primary btn-block"
                                disabled={this.state.loading}
                            >
                                {this.state.loading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                                <span>Запросить</span>
                            </button>
                        </div>

                        <div className="form-group mt-3">
                            <button className="btn btn-link btn-block" onClick={this.goToAuth}>
                                <span>Авторизоваться</span>
                            </button>
                        </div>

                        {this.state.message && (
                            <div className="form-group">
                                <Alert type="info" messages={[this.state.message]} />
                            </div>
                        )}

                        <CheckButton
                            style={{ display: "none" }}
                            ref={c => {
                                this.checkBtn = c;
                            }}
                        />
                    </Form>
                </div>
            </div>
        );
    }
}

export default withRouter(ForgotPassword);
