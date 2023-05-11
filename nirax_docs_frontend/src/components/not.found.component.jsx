import React, { Component } from "react";
import { Container } from "react-bootstrap";

export default class NotFound extends Component {

    render() {
        return (
            <Container>
                <header className="jumbotron">
                    <h3>Страница не найдена</h3>
                </header>
            </Container>
        );
    }
}
