import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isMobilePhone } from 'validator'
import { Container } from "react-bootstrap";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import messages from "../services/messages";
import Alert from "./alert.component.jsx";

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
    if (value.length > 0 &&(value.length < 6 || value.length > 40)) {
        return (
            <div className={`alert alert-danger`} role="alert">
                <p className="mb-0 small">
                    {messages.PASS_LENGTH}
                </p>
            </div>
        );
    }
};

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: null,
            userReady: false,
            currentUser: { username: "" },
            successful: false,
            message: "",
            username: "",
            phone: "",
            password: ""
        };
        this.handleUpdate = this.handleUpdate.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);
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

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    componentDidMount() {
        const currentUser = AuthService.getCurrentUser();

        if (!currentUser) this.setState({ redirect: "/home" });
        this.setState({
            currentUser: currentUser,
            userReady: true,
            username: currentUser.username,
            phone: currentUser.phone})
    }

    handleUpdate(e) {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            UserService.update(
                this.state.currentUser.id,
                this.state.username,
                this.state.password,
                this.state.phone
            ).then(

                response => {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
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
        if (this.state.redirect) {
            return <Navigate to={this.state.redirect} />
        }

        const { currentUser } = this.state;

        return (
            <Container>
                {(this.state.userReady) ?
                    <div>
                        <header className="jumbotron">
                            <h1>
                                Профиль <strong>{currentUser.username}</strong>
                            </h1>
                        </header>

                        <div className="">
                            <Form
                                onSubmit={this.handleUpdate}
                                ref={c => {
                                    this.form = c;
                                }}
                            >

                                <div>
                                    <div className="form-group mt-3">
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {currentUser.email}
                                        </p>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="username">Имя пользователя</label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={this.state.username}
                                            onChange={this.onChangeUsername}
                                            validations={[required, vusername]}
                                            style={this.state.username.length>0?{}:{borderColor: 'red'}}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Телефон</label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={this.state.phone}
                                            onChange={this.onChangePhone}
                                            validations={[required, phone]}
                                            style={this.state.phone.length>0?{}:{borderColor: 'red'}}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password">Пароль</label>
                                        <Input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            onChange={this.onChangePassword}
                                            validations={[vpassword]}
                                        />
                                    </div>

                                    <div className="form-group mt-3">
                                        <button className="btn btn-primary btn-block">Изменить</button>
                                    </div>
                                </div>

                                {this.state.message && (
                                    <div className="form-group">
                                        <Alert type={
                                                this.state.successful
                                                ? "success"
                                                : "danger"
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
                    : null
                }
            </Container>
        );
    }
}
