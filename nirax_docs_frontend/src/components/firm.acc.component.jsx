import { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import axios from 'axios';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import ModalForm from './modal.component.jsx';

import FirmAccService from "../services/firm.acc.service";

import { onKeyUp, setError } from "../services/functions";

import config from "../services/config";
import messages from '../services/messages';
import { debug } from '../services/functions';

import 'react-tooltip/dist/react-tooltip.css';

import editPng from '../images/edit.png';
import deletePng from '../images/delete.png';

export default function FirmAcc ({firmId}) {
    const [modalShow, setModalShow] = useState(false);
    const [deletedId, setDeletedId] = useState(0);
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [title, setTitle] = useState("Список счетов");
    const [type, setType] = useState();
    const [data, setData] = useState(() => {
        return {
            firmId: firmId,
            aBik: "",
            aBank: "",
            aGorodBank: "",
            aKs: "",
            aRs: "",
            id: 0,
            isDefault: false
        }
    });

    const clearAcc = () => {
        setFormErrors([])
        setData({
            firmId: firmId,
            aBik: "",
            aBank: "",
            aGorodBank: "",
            aKs: "",
            aRs: "",
            id: 0,
            isDefault: false
        })
    }

    useEffect(() => {
        if(type==="add") {
            clearAcc();
            setTitle("Добавление счета");
        }
        if(type==="edit") {
            setTitle("Редактирование счета");
            FirmAccService.get(data.id).then(
                response => {
                    if(response.data.data&&response.data.data.length>0)
                    {
                        const one = response.data.data[0]

                        setData(prev => {
                            return {
                                ...prev,
                                aBik: one.a_bik,
                                aBank: one.a_bank,
                                aGorodBank: one.a_gorod_bank,
                                aKs: one.a_ks,
                                aRs: one.a_rs,
                                isDefault: one.is_default
                            }
                        })
                    }
                },
                error => {
                    setError(error, setFormErrors);
                }
            );
        }

        if(!type){
            clearAcc();
            setTitle("Список счетов");

            getList();
        }
    }, [type])

    const getList = () =>
    {
        setIsLoaded(true);
        FirmAccService.getList(firmId).then(
            response => {
                setIsLoaded(false);
                const tempDataItems = response.data.data.map((item, i) => {
                    return (
                        <tr key={i} onDoubleClick={() => onEdit(item.id)} onKeyUp={(e) => {if (e.keyCode === 13) { onEdit(item.id)}}} tabIndex={0}>
                            <td>{item.a_bank}</td>
                            <td>{item.a_rs}</td>
                            <td>
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
                                    data-tooltip-content="Удалить счет"
                                    data-tooltip-place="right">
                                    <img src={deletePng} alt="удалить счет"/>
                                </button>
                            </td>
                        </tr>
                    )
                });
                setDataItems(tempDataItems);
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onDelete = (id) => {
        setDeletedId(id);
        setModalShow(true);
    }

    const onEdit = (id) => {
        setType("edit");
        setData({id:id});
    }

    const deleteElement = (id) => {
        FirmAccService.delete(id).then(
            response => {
                getList();
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const addNewAcc = () => {
        setType('add');
    }

    const changeInput = event => {
        event.persist();
        setData(prev => {
            return {
                ...prev,
                [event.target.id]: event.target.value,
            }
        })
    }

    const onChangeBik = (event) => {
        event.persist();
        setData(prev => {
            return {
                ...prev,
                [event.target.id]: event.target.value,
            }
        })

        if(event.target.value.length===event.target.maxLength) {
            setIsLoaded(true);
            const query = event.target.value;

            const options = {
                url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank",
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + config._dadataToken
                },
                data: JSON.stringify({query: query})
            }

            axios(options)
                .then(result => {
                    const obj = result.data;

                    if(obj.suggestions.length>0)
                    {
                        setData(prev => {
                            return {
                                ...prev,
                                aBank: obj.suggestions[0].unrestricted_value,
                                aGorodBank: obj.suggestions[0].data.payment_city,
                                aKs: obj.suggestions[0].data.correspondent_account
                            }
                        })
                    }

                    setIsLoaded(false);
                })
                .catch(error => debug(error));
        }
    }

    const validate = () => {
        if(data.aRs.length===0||data.aBank.length===0) return false;
        return true;
    }

    const saveAcc = () => {
        if(validate())
        {
            if(data.id)
            {
                FirmAccService.update(
                    data,
                    data.id
                ).then(
                    response => {
                        if(response.data) setType();
                    },
                    error => {
                        setError(error, setFormErrors);
                    }
                );
            }
            else
            {
                FirmAccService.add(
                    data
                ).then(
                    response => {
                        if(response.data.user) setType();
                    },
                    error => {
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
        setType();
    }

    const changeChecked = (event) => {
        event.persist();
        setData(prev => {
            return {
                ...prev,
                [event.target.id]: event.target.checked? true: false,
            }
        })
    }

    return (
        <div className="mt-5">
            <header className="jumbotron">
                <h1>{title}</h1>
            </header>
            <div>
                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }
                {type==="add"||type==="edit"?
                    (
                        <>
                            <Button variant='link' onClick={goBack}><ArrowLeft color="#0b5ed7"/>Назад</Button>
                            <Row>
                                <Col xs={12} sm={12} md={6}>
                                    <Form.Group className="mb-3" controlId="aBik">
                                        <Form.Label>БИК</Form.Label>
                                        <Form.Control
                                            type="text"
                                            maxLength={9}
                                            placeholder="9 цифр"
                                            onChange={onChangeBik}
                                            value={data.aBik}
                                            onKeyUp={onKeyUp}
                                            style={data.aBik&&data.aBik.length>0?{}:{borderColor:'red'}}/>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="aRs">
                                        <Form.Label>Расчётный счёт</Form.Label>
                                        <Form.Control
                                            type="text"
                                            maxLength={20}
                                            placeholder="20 цифр"
                                            onChange={changeInput}
                                            value={data.aRs}
                                            onKeyUp={onKeyUp}
                                            style={data.aRs&&data.aRs.length>0?{}:{borderColor:'red'}}/>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="aGorodBank">
                                        <Form.Label>Город банка</Form.Label>
                                        <Form.Control type="text" onChange={changeInput} value={data.aGorodBank} />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                    <Form.Group className="mb-3" controlId="aBank">
                                        <Form.Label>Банк</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            onChange={changeInput}
                                            value={data.aBank}
                                            style={data.aBank&&data.aBank.length>0?{}:{borderColor:'red'}}/>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="aKs">
                                        <Form.Label>Корр. счёт</Form.Label>
                                        <Form.Control type="text" maxLength='20' placeholder='20 цифр' onChange={changeInput} value={data.aKs} onKeyUp={onKeyUp} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        {data.isDefault?
                                            <Form.Check
                                                type='checkbox'
                                                id="isDefault"
                                                label="по умолчанию"
                                                checked
                                                onChange={changeChecked}
                                            />:
                                            <Form.Check
                                                type='checkbox'
                                                id="isDefault"
                                                label="по умолчанию"
                                                onChange={changeChecked}
                                            />
                                        }
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div>
                                <Button onClick={saveAcc}>Сохранить</Button>
                            </div>
                        </>
                    ):
                    (
                         <>
                            <div>
                                <Button onClick={addNewAcc}>Добавить</Button>
                                <Tooltip id="button-tooltip" />
                            </div>
                            {isLoaded
                                ? <Spinner/>
                                : null
                            }

                            <table className='table table-striped table-hover'>
                                <thead>
                                    <tr>
                                        <th>Название Банка</th>
                                        <th>Номер счета</th>
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
                                title="удалить счет"
                                deletedId={deletedId}
                                deleteFunc={deleteElement}
                            />
                        </>
                    )
                }
            </div>
        </div>
    );
}
