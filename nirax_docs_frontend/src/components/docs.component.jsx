import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Container } from 'react-bootstrap';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import ModalForm from './modal.component.jsx';

import DocService from "../services/doc.service";
import ProductService from "../services/product.service";
import DropdownPrint from './dropdown.component.jsx';

import { setError } from "../services/functions";
import config from '../services/config';

import 'react-dadata/dist/react-dadata.css';
import 'react-tooltip/dist/react-tooltip.css'

import editPng from '../images/edit.png';
import deletePng from '../images/delete.png';

export default function Docs () {
    const [modalShow, setModalShow] = useState(false);
    const [deletedId, setDeletedId] = useState(0);
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setFormErrors(false);

        getList();
    }, []);

    const getList = () =>
    {
        setIsLoaded(true);
        DocService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <Row key={i} tabIndex={0} className="border-bottom pb-2">
                                <Col sm={12} md={2} lg={1}><span className='d-md-none'><b>Номер: </b></span>{item.num}</Col>
                                <Col sm={12} md={2} lg={2} xl={1}><span className='d-md-none'><b>Дата: </b></span>{item.date}</Col>
                                <Col sm={12} md={2} lg={2} xl={1}><span className='d-md-none'><b>Сумма: </b></span>{item.sum}</Col>
                                <Col sm={12} md={3} lg={3} xl={3}><span className='d-md-none'><b>Компания: </b></span>{item.name_self}</Col>
                                <Col sm={12} md={3} lg={3} xl={3}><span className='d-md-none'><b>Контрагент: </b></span>{item.name}</Col>
                                <Col sm={12} md={12} lg={4} xl={2} className="mt-2">
                                    <div style={{display: 'flex'}}>
                                        <DropdownPrint doc_id={item.id} type="docx"/>
                                        <DropdownPrint doc_id={item.id} type="pdf"/>
                                        <button className='ms-3'
                                            onClick={() => onEdit(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Редактировать документ"
                                            data-tooltip-place="right">
                                            <img src={editPng} alt="редактировать документ"/>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Удалить документ"
                                            data-tooltip-place="right">
                                            <img src={deletePng} alt="удалить документ"/>
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        )
                    });
                    setDataItems(tempDataItems);
                }
                else
                {
                    setDataItems([]);
                }
            },
            error => {
                setError(error, setFormErrors);
                setIsLoaded(false)
            }
        );
    }

    const onDelete = (id) => {
        setDeletedId(id);
        setModalShow(true);
    }

    const deleteElement = (id) => {
        DocService.delete(id).then(
            response => {
                ProductService.delete_all(id).then(
                    response => {
                        getList();
                    },
                    error => {
                        setError(error, setFormErrors);
                    }
                );
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onEdit = (id) => {
        navigate(`${config._install_path}docs/${id}`);
    }

    const addNewAct = () => {
        navigate(`${config._install_path}docs/add`);
    }

    return (
        <Container>
            <header className="jumbotron">
                <h1>Список документов</h1>
            </header>
            <div>
                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }
                <Row className='mt-3 mb-3'>
                    <Col>
                    Документ - это основа для формирования печатных форм (Счет, Акт, ТОРГ-12, УПД). После заполнения и записи документа у Вас появится возможность сформировать любую печатную форму документа.
                    </Col>
                </Row>
                <div className="mb-3">
                    <Button onClick={addNewAct}>Добавить</Button>
                </div>
                {isLoaded
                    ? <Spinner/>
                    : null
                }

                <Row className="border-bottom pb-2 d-md-flex d-none">
                    <Col sm={12} md={2} lg={1}>Номер</Col>
                    <Col sm={12} md={2} lg={2} xl={1}>Дата</Col>
                    <Col sm={12} md={2} lg={2} xl={1}>Сумма</Col>
                    <Col sm={12} md={3} lg={3} xl={3}>Собственная компания</Col>
                    <Col sm={12} md={3} lg={3} xl={3}>Контрагент</Col>
                    <Col sm={12} md={12} lg={4} xl={2}>
                    <Tooltip id="button-tooltip" />
                    </Col>
                </Row>
                {dataItems}

            </div>
            <ModalForm
                show={modalShow}
                onHide={() => setModalShow(false)}
                title="удалить документ"
                deletedId={deletedId}
                deleteFunc={deleteElement}
            />
        </Container>
    );
}
