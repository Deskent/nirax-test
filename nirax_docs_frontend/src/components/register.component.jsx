import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import { isMobilePhone } from 'validator'
import { YMInitializer } from 'react-yandex-metrika';
import ym from 'react-yandex-metrika';
import { withRouter } from '../common/with-router.jsx';
import { Link } from "react-router-dom";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

import messages from "../services/messages";
import Alert from "./alert.component.jsx";
import config from "../services/config";

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

const email = value => {
    if (!isEmail(value)) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.NOT_EMAIL}
                </p>
            </div>
        );
    }
};

const phone = value => {
    value = value.replace(/\D/g, '').replace(/^7/, '8');
    if (!isMobilePhone(value, ['ru-RU'])) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.NOT_PHONE}
                </p>
            </div>
        );
    }
};

const vusername = value => {
    if (value.length < 3 || value.length > 250) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.NAME_LENGTH}
                </p>
            </div>
        );
    }
};

const vpassword = value => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.PASS_LENGTH}
                </p>
            </div>
        );
    }
};

class Register extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);

        this.state = {
            username: "",
            email: "",
            password: "",
            successful: false,
            message: "",
            phone: ""
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    goTo() {
        this.props.router.navigate(`${config._install_path}`);
        window.location.reload();
    }

    handleRegister(e) {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.register(
                this.state.username,
                this.state.email,
                this.state.password,
                this.state.phone
            ).then(
                response => {
                    console.log(response)
                    ym('reachGoal', 'registration', {});
                    AuthService.login(this.state.email, this.state.password).then(
                        () => {
                            if(!response.y_client_id)
                            {
                                const user = response;
                                ym('getClientID', (clientID) => {
                                    UserService.setClientId(user.data.data.id, clientID).then(
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
                            else{
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
                },
                error => {
                    const resMessage =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.message ||
                        error.toString();

                    this.setState({
                        successful: false,
                        message: resMessage
                    });
                }
            );
        }
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="card card-container">
                    <div style={{position: 'absolute', top: '10px', right: '20px'}} className="d-sm-none">
                        Уже есть аккаунт? <Link to={`${config._install_path}login`}>
                            Войти
                        </Link>
                    </div>
                    <header className="jumbotron">
                        <h3>Регистрация в NIRAX: Генератор документов</h3>
                        <YMInitializer accounts={[55869127]} />
                    </header>
                    <Form
                        onSubmit={this.handleRegister}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        {!this.state.successful && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="email">Email<span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        value={this.state.email}
                                        onChange={this.onChangeEmail}
                                        validations={[required, email]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Пароль<span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={this.state.password}
                                        onChange={this.onChangePassword}
                                        validations={[required, vpassword]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">ФИО пользователя<span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={this.state.username}
                                        onChange={this.onChangeUsername}
                                        validations={[required, vusername]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Телефон<span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={this.state.phone}
                                        onChange={this.onChangePhone}
                                        validations={[required, phone]}
                                    />
                                </div>
                                <div className="form-group mt-3">
                                    <button className="btn btn-primary btn-block">Зарегистрироваться</button>
                                </div>
                            </div>
                        )}

                        {this.state.message && (
                            <div className="form-group">
                                <Alert type={
                                        this.state.successful
                                        ? "alert alert-success"
                                        : "alert alert-danger"
                                    }
                                    messages={[this.state.message]}/>
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

export default withRouter(Register);
