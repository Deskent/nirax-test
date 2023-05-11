import { Form, Row, Col, Button, Container } from 'react-bootstrap';
import { PartySuggestions } from 'react-dadata';
import { Tooltip } from 'react-tooltip'
import { useRef } from 'react';
import { useState } from 'react';
import { XCircle } from 'react-bootstrap-icons';

import Bank from './bank.component.jsx';
import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import ClientService from "../services/client.service";

import { setError } from "../services/functions";

import 'react-tooltip/dist/react-tooltip.css';
import messages from '../services/messages';

export default function Contr({data, changeInput, onKeyUp, onChangeBik, token, onChange, setData, onChangeInn }){
    const [selectedItem, setSelectedItem] = useState([]);
    const [selectItems, setSelectItems] = useState();
    const [display, setDisplay] = useState('none');
    const [isLoaded, setIsLoaded] = useState(false);
    const [formErrors, setFormErrors] = useState([]);

    const checkRef = useRef([]);

    const FL = (
        <>
            <Form.Group className="mb-3" controlId="inn">
                <Form.Label>ИНН</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="12 цифр"
                    maxLength={12}
                    onChange={onChangeInn}
                    value={data.inn}
                    onKeyUp={onKeyUp}
                    style={data.inn.length>0?{}:{borderColor:'red'}}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="fio">
                <Form.Label>ФИО</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.fio} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Телефон</Form.Label>
                <Form.Control type="text"  onChange={(event) => changeInput(event, setData)} value={data.phone}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="addr">
                <Form.Label>Адрес</Form.Label>
                <Form.Control as="textarea" rows={3}  onChange={(event) => changeInput(event, setData)} value={data.addr}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="buh">
                <Form.Label>Бухгалтер</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.buh}/>
            </Form.Group>
            <Bank onChangeBik={onChangeBik}
                bikName="bik"
                bikValue={data.bik}
                onKeyUp={onKeyUp}
                bankName="bank"
                bankValue={data.bank}
                setData={setData}
                bankCityName="bankCity"
                bankCityValue={data.bankCity}
                rsName="rs"
                rsValue={data.rs}
                ksName="ks"
                ksValue={data.ks}
                clientId={selectedItem?selectedItem.id:0}/>
        </>
    )
    const UL = (
        <>
            <Form.Group className="mb-3" controlId="inn">
                <Form.Label>ИНН</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="10 цифр"
                    maxLength={10}
                    onChange={onChangeInn}
                    value={data.inn}
                    onKeyUp={onKeyUp}
                    style={data.inn.length>0?{}:{borderColor:'red'}}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="kpp">
                <Form.Label>КПП</Form.Label>
                <Form.Control type="text" placeholder="9 цифр" maxLength={9} onChange={(event) => changeInput(event, setData)} value={data.kpp} onKeyUp={onKeyUp} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Название</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)} value={data.name} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Телефон</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.phone}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="addr">
                <Form.Label>Юр. адрес</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)} value={data.addr} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="dir">
                <Form.Label>Руководитель</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)}  value={data.dir}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="staff">
                <Form.Label>Должность руководителя</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)}  value={data.staff}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="buh">
                <Form.Label>Бухгалтер</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.buh}/>
            </Form.Group>
            <Bank onChangeBik={onChangeBik}
                bikName="bik"
                bikValue={data.bik}
                onKeyUp={onKeyUp}
                bankName="bank"
                bankValue={data.bank}
                setData={setData}
                bankCityName="bankCity"
                bankCityValue={data.bankCity}
                rsName="rs"
                rsValue={data.rs}
                ksName="ks"
                ksValue={data.ks}
                clientId={selectedItem? selectedItem.id: 0}/>
        </>
    );

    const selectItem = () => {
        checkRef.current.map(item => item.checked = false);

        setSelectedItem(0);
        setIsLoaded(true);
        ClientService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    setDisplay('')
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <Row key={i} tabIndex={0} className="border-bottom pb-2">
                                <Col xs={1}>
                                    <Form.Check
                                        type="radio"
                                        id={`cb-${item.id}`}
                                        label={``}
                                        onChange={(event) => addSelectItem(item.id, response.data.data, event)}
                                        ref={el => checkRef.current[item.id] = el}
                                    />
                                </Col>
                                <Col>{item.form_reg==='1'? item.c_fio:item.c_name}</Col>
                            </Row>
                        )
                    });
                    setSelectItems(tempDataItems);
                }
                else
                {
                    setSelectItems([]);
                    setError(messages.ERROR_NOT_FIND, setFormErrors);
                }
            },
            error => {
                setError(error, setFormErrors);
                setIsLoaded(false)
            }
        );
    }

    const addSelectItem = (id, items, event) => {

        if(event.target.checked===true)
        {
            const tempItems = items.filter(item => item.id === id);
            checkRef.current.map(item => {
                if(item.id!==event.target.id) item.checked = false;
                return item
            });

            if(tempItems.length>0)
            {
                setSelectedItem(tempItems[0])
            }
        }
        else{
             setSelectedItem(0)
        }
    }

    const addSelectedItems = (event) => {
        event.preventDefault();
        setDisplay('none');
        if(selectedItem)
        {
            setData(prev => {
                return {
                    ...prev,
                    formReg: selectedItem.form_reg,
                    inn: selectedItem.c_inn,
                    fio: (selectedItem.form_reg==="1"? selectedItem.c_name: ""),
                    addr: selectedItem.c_addr,
                    kpp: selectedItem.c_kpp,
                    name: (selectedItem.form_reg==="1"? "": selectedItem.c_name),
                    dir: selectedItem.c_dir,
                    staff: selectedItem.c_dir_staff,
                    phone: selectedItem.c_phone,
                    buh: selectedItem.c_buh,
                    bank: "",
                    rs: "",
                    bik: "",
                    ks: "",
                    bankCity: "",
            }});
        }
    }

    return (
        <>
            <h2>Контрагент</h2>
            {formErrors.length
                ? <Alert type="danger" messages={formErrors} />
                : null
            }
            {isLoaded
                ? <Spinner/>
                : null
            }
            <Row>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Введите ФИО, название или ИНН</Form.Label>
                        <PartySuggestions
                            token={token}
                            onChange={(event) => onChange(event, 'customer')}
                            count={5}
                            minChars={3}
                            inputProps={{placeholder:`Введите ФИО или название в свободной форме, ИНН или ОГРН`,
                                        id: 'customer',
                                        'data-tooltip-id': "button-tooltip",
                                        'data-tooltip-content': "Введите ФИО или название в свободной форме, ИНН или ОГРН",
                                        'data-tooltip-place': "bottom"}}
                            value=""
                             />
                            <Tooltip id="button-tooltip" />
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    <div style={{marginTop: '34px', textAlign: 'end'}}>
                        <Button variant="primary" className="m-2" onClick={() => selectItem()}>
                            Подбор из списка
                        </Button>
                    </div>
                </Col>
            </Row>


            {(data.formReg==="1"? FL : UL)}
            <div style={{display: display, position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2, cursor: 'pointer'}}>
                <Container className="border rounded p-5" style={{display: display, position:'relative', background: '#fff', opacity:'unset'}}>
                    <XCircle color="#0b5ed7" onClick={() => setDisplay('none')} style={{cursor: 'pointer', position: 'absolute', right: '30px', top: '30px', width: '20px', height: '20px'}}/>
                    <header className="jumbotron">
                        <h1>Список клиентов</h1>
                    </header>

                    <div>
                        <Row className="border-bottom pb-2 mt-3">
                            <Col xs={2}></Col>
                            <Col>Название</Col>
                        </Row>
                        {selectItems}
                        <Row>
                            <Col>
                                <Button
                                    className="mt-1"
                                    onClick={addSelectedItems}>
                                        Выбрать
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        </>
    )
}
