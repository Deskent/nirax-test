import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import ModalForm from './modal.component.jsx';

import ProductsService from "../services/products.service";

import { setError } from "../services/functions";
import config from '../services/config';

import 'react-tooltip/dist/react-tooltip.css'

import editPng from '../images/edit.png';
import deletePng from '../images/delete.png';

export default function ProductList () {
    const [modalShow, setModalShow] = useState(false);
    const [deletedId, setDeletedId] = useState(0);
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setFormErrors(false);

        getList();
    }, [])

    const getList = () =>
    {
        setIsLoaded(true);
        ProductsService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <Row key={i} tabIndex={0} className="border-bottom pb-2">
                                <Col>{item.name}</Col>
                                <Col>{item.price}</Col>
                                <Col>{item.nds}</Col>
                                <Col className="mt-2">
                                    <div style={{display: 'flex'}}>
                                        <button className='ms-3'
                                            onClick={() => onEdit(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Редактировать"
                                            data-tooltip-place="right">
                                            <img src={editPng} alt="редактировать"/>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Удалить"
                                            data-tooltip-place="right">
                                            <img src={deletePng} alt="удалить"/>
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
        ProductsService.delete(id).then(
            response => {
                getList();
            },
            error => {
                console.log(error)
                setError(error, setFormErrors);
            }
        );
    }

    const onEdit = (id) => {
        navigate(`${config._install_path}products/${id}`);
    }

    const addNewAct = () => {
        navigate(`${config._install_path}products/add`);
    }

    return (
        <div className="container">
            <header className="jumbotron">
                <h1>Список товаров/услуг</h1>
            </header>
            <div>
                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }
                <div>
                    <Button onClick={addNewAct}>Добавить</Button>
                </div>
                {isLoaded
                    ? <Spinner/>
                    : null
                }

                <Row className="border-bottom pb-2 mt-3">
                    <Col>Название</Col>
                    <Col>Цена</Col>
                    <Col>НДС %</Col>
                    <Col>
                        <Tooltip id="button-tooltip" />
                    </Col>
                </Row>
                {dataItems}

            </div>
            <ModalForm
                show={modalShow}
                onHide={() => setModalShow(false)}
                title="удалить элемент"
                deletedId={deletedId}
                deleteFunc={deleteElement}
            />
        </div>
    );
}
