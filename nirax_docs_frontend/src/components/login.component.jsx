import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { YMInitializer } from 'react-yandex-metrika';
import ym from 'react-yandex-metrika';
import { Link } from "react-router-dom";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

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

class Login extends Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
            username: "",
            password: "",
            loading: false,
            message: ""
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    goTo(){
        this.props.router.navigate(`${config._install_path}`);
        window.location.reload();
    }

    handleLogin(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.login(this.state.username, this.state.password).then(
                (response) => {
                    if(!response.y_client_id)
                    {
                        const user = response;
                        ym('getClientID', (clientID) => {
                            UserService.setClientId(user.id, clientID).then(
                                (response) => {
                                    this.goTo();
                                },
                                error => {
                                    const resMessage =
                                        (error.response &&
                                        error.response.data &&
                                        error.response.data.message) ||
                                        error.message ||
                                        error.toString();

                                    this.setState({
                                        loading: false,
                                        message: resMessage
                                    });
                                }
                            );
                        });
                    }
                    else
                    {
                        this.goTo();
                    }
                },
                error => {
                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();

                    this.setState({
                        loading: false,
                        message: resMessage
                    });
                }
            );
        } else {
            this.setState({
                loading: false
            });
        }
    }

    forgotPassword = () =>{
        this.props.router.navigate(`${config._install_path}forgotpassword`);
    }

    render() {
        return (
            <div className="col-md-12">
                <YMInitializer accounts={[1175482]} />

                <div className="card card-container">
                    <div style={{position: 'absolute', top: '10px', right: '20px'}} className="d-sm-none">
                        Еще нет аккаунта? <Link to={`${config._install_path}register`}>
                            Зарегистрироваться
                        </Link>
                    </div>
                    <header className="jumbotron">
                        <h3>Вход в NIRAX: Генератор документов</h3>
                    </header>
                    <Form
                        onSubmit={this.handleLogin}
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

                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <Input
                                type="password"
                                className="form-control"
                                name="password"
                                value={this.state.password}
                                onChange={this.onChangePassword}
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
                                <span>Войти</span>
                            </button>
                        </div>

                        <div className="form-group mt-3">
                            <button className="btn btn-link" onClick={this.forgotPassword}>
                                <span>Забыли пароль?</span>
                            </button>
                        </div>

                        {this.state.message && (
                            <div className="form-group">
                                <Alert messages={[this.state.message]} />
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

export default withRouter(Login);
