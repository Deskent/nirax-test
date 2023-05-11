import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { saveAs } from 'file-saver';

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import ShablonService from "../services/shablon.service";

import { changeInput, setError } from "../services/functions";
import messages from '../services/messages';

import config from "../services/config";

export default function ShablonEdit () {
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState("Добавление шаблона");

    const navigate = useNavigate();
    const params = useParams();

    const [data, setData] = useState(() => {
        return {
            id: 0,
            name: "",
            file: ""
        }
    })

    useEffect(() => {
        setFormErrors([]);
        if(params.id)
        {
            setTitle("Редактирование шаблона");
            ShablonService.get(
                params.id
            ).then(
                response => {
                    const one = response.data.data[0];

                    setData({
                        id: params.id,
                        name: one.name,
                        file: one.file
                    });
                    setIsLoaded(false);
                },
                error => {
                    setIsLoaded(false);
                    setError(error, setFormErrors);
                }
            );
        }
        else
        {
            setTitle("Добавление шаблона");
        }
    }, [])

    const validate = () => {
        if(params.id===undefined && data.file===undefined) return false;
        if(data.name.length===0) return false;
        return true;
    }

    const saveShablon = (event) => {
        event.preventDefault();

        if(validate())
        {
            setIsLoaded(true);
            if(data.id)
            {
                ShablonService.update(
                    data
                ).then(
                    response => {
                        setIsLoaded(false);
                    },
                    error => {
                        setError(error, setFormErrors);
                        setIsLoaded(false);
                    }
                );
            }
            else
            {
                ShablonService.add(
                    data
                ).then(
                    response => {
                        setIsLoaded(false);
                        setData(prev => {
                            return {
                                ...prev,
                                id: response.data.data.id
                            }
                        })
                    },
                    error => {
                        setIsLoaded(false);
                        setError(error, setFormErrors);
                    }
                );
            }
        }
        else{
            setFormErrors([messages.EMPTY_FORM]);
        }
    }

    const goBack = () => {
        navigate(`${config._install_path}shablons`);
    }

    const changeFileInput = (event) => {
        setData(prev => {
            return {
                ...prev,
                file: event.target.files[0]
            }
        })
    }

    const getFile = () => {
        const id = (params.id?params.id: data.id);
        ShablonService.getFile(
           id
        ).then(
            response => {
                setIsLoaded(false);
                const pdfBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                saveAs(pdfBlob, `${data.name}.docx`);
            },
            error => {
                setIsLoaded(false);
                setError(error, setFormErrors);
            }
        );
    }

    return (
        <div className="container">
            <header className="jumbotron">
                <h1>{title}</h1>
            </header>
            <Button variant='link' onClick={goBack}><ArrowLeft color="#0b5ed7"/>Назад</Button>
            <div>
                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }

                <Form onSubmit={saveShablon}>
                    {isLoaded? <Spinner/>:null}

                    <Row className='mt-5'>
                        <Col xs={12} sm={12} md={12}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Название</Form.Label>
                                <Form.Control type="text" value={data.name} onChange={(event) => changeInput(event, setData)} />
                            </Form.Group>
                            <Form.Group controlId="file" className="mb-3">
                                <Form.Label>{params.id? 'Выберите новый файл шаблона': 'Файл шаблона'}</Form.Label>
                                <Form.Control type="file" onChange={changeFileInput} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{position: 'relative'}}>
                            <div style={{float: 'right'}}>
                                {data.id?
                                    <Button variant="primary" className="m-2" onClick={getFile}>
                                        Скачать
                                    </Button> :
                                    null}
                                <Button variant="primary" className="m-2" type="submit">
                                    Сохранить
                                </Button>
                                <Button variant="primary" className="m-2" onClick={goBack}>
                                    Выйти
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
}
