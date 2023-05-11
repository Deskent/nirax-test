import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import {Container, Nav, Navbar, Row, Col } from 'react-bootstrap';

import AuthService from "./services/auth.service";
import config from "./services/config";
import AuthVerify from "./common/auth-verify.jsx";
import EventBus from "./common/EventBus.jsx";

import Login from "./components/login.component.jsx";
import Register from "./components/register.component.jsx";
import Home from "./components/home.component.jsx";
import Profile from "./components/profile.component.jsx";
import Firm from './components/firm.component.jsx';
import ErrorBoundary from "./common/errorBoundary.jsx";
import Docs from './components/docs.component.jsx';
import DocEdit from './components/doc.edit.component.jsx';
import Shablons from "./components/shablons.component.jsx";
import ShablonEdit from "./components/shablon.edit.component.jsx";
import DocPrint from "./components/print.component.jsx";
import ForgotPassword from "./components/forgot.password.component.jsx";
import Products from "./components/product.list.component.jsx";
import ProductsEdit from "./components/product.list.edit.component.jsx";
import Clients from "./components/client.component.jsx";

import firmPng from '../src/images/company.png';
import docPng from '../src/images/documents.png';
import patternPng from '../src/images/shablon.png';

class App extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);

        this.state = {
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
            showRegister: false
        };
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();

        if (user) {
            this.setState({
                currentUser: user,
                showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
                showAdminBoard: user.roles.includes("ROLE_ADMIN"),
                showRegister: true
            });
        }
        EventBus.on("logout", () => {
            this.logOut();
        });
    }

    componentWillUnmount() {
        EventBus.remove("logout");
    }

    logOut() {
        AuthService.logout();
        this.setState({
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
        });
    }

    render() {
        const { currentUser, showAdminBoard } = this.state;

        return (
            <div style={{minHeight: '100vh', display: 'flex', flexWrap: 'wrap', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                <Navbar expand="lg">
                    <Container className="border-bottom justify-content-between pb-2">
                        <Navbar.Brand href="https://nirax.ru/products/gendocs_card/" className="px-2" target="_blank">
                            <img alt="Nirax Logo" src="https://nirax.ru/wp-content/uploads/2016/12/logo-white-50-1.png"/>
                        </Navbar.Brand>
                        <a href="tel:88007775308" className="nav-link d-lg-none">8 (800) 777-53-08</a>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav justify-content-between">
                            <Nav className="mr-auto justify-content-between" style={{width:'100%'}}>
                                <li className="nav-item">
                                    <Link to={`${config._install_path}home`} className="nav-link">
                                        Главная
                                    </Link>
                                </li>

                                {showAdminBoard && (
                                    <li className="nav-item">
                                        <Link to={`${config._install_path}admin`} className="nav-link">
                                            Admin
                                        </Link>
                                    </li>
                                )}

                                {currentUser && (
                                    <>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}firm`} className="nav-link">
                                            Мои компании
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}docs`} className="nav-link">
                                            Мои документы
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}products`} className="nav-link">
                                            Товары/услуги
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}clients`} className="nav-link">
                                            Клиенты
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}shablons`} className="nav-link">
                                            Шаблоны
                                            </Link>
                                        </li>
                                    </>
                                )}
                                <Nav.Link href="tel:88007775308">8 (800) 777-53-08</Nav.Link>

                                {currentUser ? (
                                    <>
                                        <div style={{display: 'flex'}}>
                                            <li className="nav-item">
                                                <Link to={`${config._install_path}profile`} className="nav-link">
                                                Профиль
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to={`${config._install_path}`} onClick={this.logOut} className="nav-link d-none d-lg-block">
                                                    Выйти
                                                </Link>
                                            </li>
                                        </div>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}`} className="nav-link d-lg-none" onClick={this.logOut}>
                                            Выйти
                                            </Link>
                                        </li>
                                    </>

                                ) : (
                                    <>
                                        <div style={{display: 'flex'}}>
                                            <li className="nav-item">
                                                <Link to={`${config._install_path}login`} className="nav-link">
                                                Вход
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to={`${config._install_path}register`} className="nav-link d-none d-lg-block">
                                                Регистрация
                                                </Link>
                                            </li>
                                        </div>
                                        <li className="nav-item">
                                            <Link to={`${config._install_path}register`} className="nav-link d-lg-none">
                                            Регистрация
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <div className="container mt-3" style={{ flexGrow: 1}}>
                    <ErrorBoundary>
                        <Routes>
                            <Route path={`${config._install_path}`} element={<Home />} />
                            <Route path={`${config._install_path}home`} element={<Home />} />
                            <Route path={`${config._install_path}login`} element={<Login />} />
                            <Route path={`${config._install_path}forgotpassword`} element={<ForgotPassword />} />
                            <Route path={`${config._install_path}register`} element={<Register />} />
                            <Route path={`${config._install_path}profile`} element={<Profile />} />
                            <Route path={`${config._install_path}firm`} element={<Firm />} />
                            <Route path={`${config._install_path}firm/add`} element={<Firm type="add" />} />
                            <Route path={`${config._install_path}firm/:id`} element={<Firm type="edit" />} />
                            <Route path={`${config._install_path}docs/:id`} element={<DocEdit />} />
                            <Route path={`${config._install_path}docs/add`} element={<DocEdit />} />
                            <Route path={`${config._install_path}docs`} element={<Docs />} />
                            <Route path={`${config._install_path}shablons/:id`} element={<ShablonEdit />} />
                            <Route path={`${config._install_path}shablons/add`} element={<ShablonEdit />} />
                            <Route path={`${config._install_path}shablons`} element={<Shablons />} />
                            <Route path={`${config._install_path}docprint`} element={<DocPrint />} />
                            <Route path={`${config._install_path}products`} element={<Products />} />
                            <Route path={`${config._install_path}products/:id`} element={<ProductsEdit />} />
                            <Route path={`${config._install_path}products/add`} element={<ProductsEdit />} />
                            <Route path={`${config._install_path}clients`} element={<Clients />} />
                            <Route path={`${config._install_path}clients/:id`} element={<Clients type="edit" />} />
                            <Route path={`${config._install_path}clients/add`} element={<Clients type="add" />} />
                            <Route path="*" element={<Home />} />
                        </Routes>
                    </ErrorBoundary>
                </div>


                <footer className="mt-5" style={{background: '#23272a', padding: '30px 0 20px', color: '#d2d2d2', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '16px', lineHeight: '1.42857143'}}>
                    <div className="container">
                        <div className="footer-copyright row">
                            <div className="col-xs-12">
                                <p>
                                    &nbsp;© 2010-{new Date().getFullYear()} Nirax - Разработка решений в сфере управления бизнесом
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
                {currentUser && (
                    <Container className="text-center" style={{position: 'fixed', bottom: 0, background: '#fff'}}>
                        <Row className="d-sm-none d-flex mt-2 mb-2">
                            <Col>
                                <Link to={`${config._install_path}firm`}>
                                    <img src={firmPng} alt="Компании"/><br />
                                    Компании
                                </Link>
                            </Col>
                            <Col>
                                <Link to={`${config._install_path}docs`}>
                                    <img src={docPng} alt="Документы"/><br />
                                    Документы
                                </Link>
                            </Col>
                            <Col>
                                <Link to={`${config._install_path}shablons`}>
                                    <img src={patternPng} alt="Шаблоны"/><br />
                                    Шаблоны
                                </Link>
                            </Col>
                        </Row>
                    </Container>
                )}
                <AuthVerify logOut={this.logOut}/>
            </div>
        );
    }
}

export default App;
