import { useState, useEffect } from 'react';

import { Form, Row, Col } from 'react-bootstrap';

import Alert from './alert.component.jsx';

import { changeInput, setError } from "../services/functions";

import ClientAccService from '../services/client.acc.service';

export default function Bank ({onChangeBik, bikName, bikValue, onKeyUp, bankName, bankValue, setData, bankCityName, bankCityValue, rsName, rsValue, ksName, ksValue, clientId})
{
    const [dataAccItems, setDataAccItems] = useState();
    const [formErrors, setFormErrors] = useState([]);

    useEffect(() => {
        if(clientId)
        {
            loadAccSelect(clientId);
        }
    }, [clientId])

    const loadAccSelect = (firmId) => {
        ClientAccService.getList(clientId).then(
            response => {
                let defAccId = 0;
                const tempDataItems = response.data.data.map((item, i) => {
                    if(i===0) defAccId = item.id;
                    if(item.is_default) defAccId = item.id;
                    return (
                        <option key={i} value={item.id}>{item.a_rs}</option>
                    )
                });
                setDataAccItems(tempDataItems);
                if(defAccId){
                    loadAcc(defAccId);
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const loadAcc = (id) => {
        ClientAccService.get(id).then(
            response => {
                if(response.data.data&&response.data.data.length>0)
                {
                    const one = response.data.data[0]
                    setData(prev => {
                        return {
                            ...prev,
                            bank: one.a_bank,
                            bankCity: one.a_gorod_bank,
                            rs: one.a_rs,
                            bik: one.a_bik,
                            ks: one.a_ks
                        }
                    })
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onChangeBikSelect = (event) => {
        loadAcc(event.target.value);
        changeInput(event, setData);
    }

    return (
        <>
            {formErrors.length
                ? <Alert type="danger" messages={formErrors} />
                : null
            }
            <Form.Group className="mb-3" controlId={bikName}>
                <Row>
                    <Col>
                        <Form.Label>Введите БИК</Form.Label>
                        <Form.Control type="text" maxLength={9} placeholder="9 цифр" onChange={onChangeBik} value={bikValue} onKeyUp={onKeyUp} />
                    </Col>
                    <Col>
                        <Form.Label>или выберите из списка</Form.Label>
                        <Form.Select aria-label="Выберите из списка" onChange={onChangeBikSelect} className="btn btn-secondary">
                            <option key={0} value={0}>-- Выберите из списка --</option>
                            {dataAccItems}
                        </Form.Select>
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId={bankName}>
                <Form.Label>Банк</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)}  value={bankValue}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId={bankCityName}>
                <Form.Label>Город банка</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={bankCityValue} />
            </Form.Group>
            <Form.Group className="mb-3" controlId={rsName}>
                <Form.Label>Расчётный счёт</Form.Label>
                <Form.Control type="text" maxLength={20} placeholder="20 цифр"  onChange={(event) => changeInput(event, setData)} value={rsValue} onKeyUp={onKeyUp}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId={ksName}>
                <Form.Label>Корр. счёт</Form.Label>
                <Form.Control type="text" maxLength='20' placeholder='20 цифр' onChange={(event) => changeInput(event, setData)} value={ksValue} onKeyUp={onKeyUp} />
            </Form.Group>
        </>
    )
}
