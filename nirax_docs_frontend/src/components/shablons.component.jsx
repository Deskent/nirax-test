import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import ModalForm from './modal.component.jsx';

import ShablonService from "../services/shablon.service";
import StandartService from "../services/standart.service";

import { setError } from "../services/functions";
import config from '../services/config';

import editPng from '../images/edit.png';
import deletePng from '../images/delete.png';

import 'react-tooltip/dist/react-tooltip.css'

export default function Shablons () {
    const [modalShow, setModalShow] = useState(false);
    const [deletedId, setDeletedId] = useState(0);
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [standartItems, setStandartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setFormErrors(false);
        getList();
    }, []);

    const getList = () =>
    {
        setIsLoaded(true);
        ShablonService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <tr key={i} tabIndex={0}>
                                <td>{item.name}</td>
                                <td>
                                    <div style={{display: 'flex'}}>
                                        <Button
                                            variant="primary"
                                            className="m-2"
                                            onClick={() => getFile(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Скачать файл шаблона"
                                            data-tooltip-place="right">
                                            Скачать
                                        </Button>
                                        <button
                                            className='ms-3'
                                            onClick={() => onEdit(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Редактировать"
                                            data-tooltip-place="right">
                                            <img src={editPng} alt="редактировать шаблон"/>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Удалить"
                                            data-tooltip-place="right">
                                            <img src={deletePng} alt="удалить шаблон"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
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
        StandartService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <tr key={i} tabIndex={0}>
                                <td>{item.name}</td>
                                <td>
                                    <div style={{display: 'flex'}}>
                                        <Button
                                            variant="primary"
                                            className="m-2"
                                            onClick={() => getStandart(item.type)}
                                            data-tooltip-id="button-tooltip"
                                            data-tooltip-content="Скачать файл стандартного шаблона"
                                            data-tooltip-place="right">
                                            Скачать
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )
                    });
                    setStandartItems(tempDataItems);
                }
                else
                {
                    setStandartItems([]);
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

    const onEdit = (id) => {
        navigate(`${config._install_path}shablons/${id}`);
    }

    const deleteElement = (id) => {
        ShablonService.delete(id).then(
            response => {
                getList();
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const addNewShablon = () => {
        navigate(`${config._install_path}shablons/add`);
    }

    const getFile = (id) => {
        ShablonService.getFile(
           id
        ).then(
            response => {
                setIsLoaded(false);
                const pdfBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                saveAs(pdfBlob, `${id}.docx`);
            },
            error => {
                setIsLoaded(false);
                setError(error, setFormErrors);
            }
        );
    }

    const getStandart = (type) => {
        StandartService.getFile(
            type
         ).then(
             response => {
                 setIsLoaded(false);
                 const pdfBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                 saveAs(pdfBlob, `${type}.docx`);
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
                <h1>Список шаблонов</h1>
            </header>
            <Row>
                <Col className='mb-3'>
                    Любой Стандартный шаблон вы можете скачать, внести в него изменения (логотип, текст, оформление).<br/>
                    Далее по кнопке Добавить  загрузить измененный шаблон, придумать ему имя и в дальнейшем выбирать его при формировании документа.
                </Col>
            </Row>
            <Row>
                <Col>
                    {formErrors.length
                        ? <Alert type="danger" messages={formErrors} />
                        : null
                    }
                    <div>
                        <Button variant='primary' onClick={addNewShablon}>Добавить</Button>
                        <Tooltip id="button-tooltip" />
                    </div>
                    {isLoaded
                        ? <Spinner/>
                        : null
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <div>
                        <table className='table table-striped table-hover'>
                            <thead>
                                <tr>
                                    <th>Личные шаблоны</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataItems}
                            </tbody>
                        </table>
                        <ModalForm
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                title="удалить шаблон"
                                deletedId={deletedId}
                                deleteFunc={deleteElement}
                            />
                    </div>
                </Col>
                <Col>
                    <table className='table table-striped table-hover'>
                        <thead>
                            <tr>
                                <th>Стандартные шаблоны</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {standartItems}
                        </tbody>
                    </table>
                </Col>
            </Row>
        </div>
    );
}
