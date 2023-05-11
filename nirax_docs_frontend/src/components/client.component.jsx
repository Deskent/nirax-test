import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Row, Col, Container, Button } from 'react-bootstrap';
import { PartySuggestions } from 'react-dadata';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import ClientAcc from './client.acc.component.jsx';
import ModalForm from './modal.component.jsx';

import ClientService from "../services/client.service";

import { returnInnData, onKeyUp, getUserId, setError } from "../services/functions";

import config from "../services/config";
import messages from '../services/messages';

import 'react-dadata/dist/react-dadata.css';
import 'react-tooltip/dist/react-tooltip.css'

import editPng from '../images/edit.png';
import deletePng from '../images/delete.png';

export default function Client ({type}) {
    const [modalShow, setModalShow] = useState(false);
    const [deletedId, setDeletedId] = useState(0);
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [title, setTitle] = useState("Список компаний");
    const navigate = useNavigate();
    const [data, setData] = useState(() => {
        return {
            formReg: "1",
            inn: "",
            fio: "",
            addr: "",
            name: "",
            dir: "",
            staff: "",
            kpp: "",
            phone: "",
            buh: "",
            uId: getUserId(),
            isDefault: false
        }
    });
    const params = useParams();

    const clearData = () => {
        setData({
            formReg: "1",
            inn: "",
            fio: "",
            addr: "",
            name: "",
            dir: "",
            staff: "",
            kpp: "",
            phone: "",
            buh: "",
            uId: getUserId(),
            isDefault: false
        })
    }

    useEffect(() => {
        if(type==="add")
        {
            setTitle("Добавление клиента");
            clearData();
        }
        if(type==="edit") {
            setTitle("Редактирование клиента");
            ClientService.get(params.id).then(
                response => {
                    if(response.data.data)
                    {
                        const one = response.data.data[0]
                        setData(prev => {
                            return {
                                ...prev,
                                formReg: one.form_reg,
                                inn: one.c_inn,
                                fio: one.c_fio,
                                addr: one.c_addr,
                                name: one.c_name,
                                dir: one.c_dir,
                                staff: one.c_dir_staff,
                                kpp: one.c_kpp,
                                phone: one.c_phone,
                                buh: one.c_buh,
                                uId: getUserId(),
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
            clearData();
            setTitle("Список клиентов");
            getList();
        }
    }, [type])

    const getList = () =>
    {
        setIsLoaded(true);
        ClientService.getList().then(
            response => {
                setIsLoaded(false);
                const tempDataItems = response.data.data.map((item, i) => {
                    return (
                        <tr key={i} onDoubleClick={() => onEdit(item.id)} onKeyUp={(e) => {if (e.keyCode === 13) { onEdit(item.id)}}} tabIndex={0}>
                            <td>{item.form_reg==='1'? item.c_fio:item.c_name}</td>
                            <td>{item.c_inn}</td>
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
                                    data-tooltip-content="Удалить документ"
                                    data-tooltip-place="right">
                                    <img src={deletePng} alt="удалить документ"/>
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

    const deleteElement = (id) => {
        ClientService.delete(id).then(
            response => {
                getList();
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onEdit = (id) => {
        navigate(`${config._install_path}clients/${id}`);
    }

    const goBack = () => {
        navigate(`${config._install_path}clients`);
    }

    const addNewClient = () => {
        navigate(`${config._install_path}clients/add`);
    }

    const onChangeInn = (event) => {
        event.persist();
        setData(prev => {
            return {
                ...prev,
                formReg: (event.target.value.length>10? "1":"2"),
                [event.target.id]: event.target.value,
            }
        })

        if(event.target.value.length>=10) {
            setIsLoaded(true);

            const query = event.target.value;

            returnInnData(query)
                .then((dataInn) => {
                    if(dataInn)
                    {
                        setData(prev => {
                            return {
                                ...prev,
                                fio: dataInn.name.full,
                                addr: dataInn.address?dataInn.address.unrestricted_value: '',
                                kpp: dataInn.kpp,
                                name: dataInn.name.full,
                                formReg: (dataInn.type==="LEGAL"? "2":"1"),
                            }
                        })
                    }
                    else
                    {
                        setFormErrors([messages.ERROR_NOT_FIND]);
                    }
                    setIsLoaded(false);
                })
        }
    }

    const onChange = (event) => {
        if(event.value)
        {
            setData(prev => {

                return {
                    ...prev,
                    inn: event.data.inn,
                    fio: event.data.name.full,
                    addr: event.data.address?event.data.address.unrestricted_value:'',
                    kpp: event.data.kpp,
                    name: event.data.name.full,
                    formReg: (event.data.type==="LEGAL"? "2":"1"),
                    staff: ( event.data.management? event.data.management.post:""),
                    dir: ( event.data.management?event.data.management.name:"")
                }
            })
        }
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

    const customerFL = (
        <>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="inn">
                        <Form.Label>ИНН</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="10-12 цифр"
                            maxLength={12}
                            onChange={onChangeInn}
                            value={data.inn}
                            onKeyUp={onKeyUp}
                            style={data.inn.length>0?{}:{borderColor:'red'}}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="fio">
                        <Form.Label>ФИО</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={changeInput}
                            value={data.fio}
                            style={data.fio.length>0?{}:{borderColor:'red'}}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Телефон</Form.Label>
                        <Form.Control type="text" onChange={changeInput} value={data.phone}/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="addr">
                        <Form.Label>Адрес</Form.Label>
                        <Form.Control as="textarea" rows={3}  onChange={changeInput} value={data.addr}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="buh">
                        <Form.Label>Бухгалтер</Form.Label>
                        <Form.Control type="text" onChange={changeInput} value={data.buh}/>
                    </Form.Group>
                </Col>
            </Row>
        </>
    )
    const customerUL = (
        <>
            <Row>
                <Col xs={12} sm={12} md={6}>
                    <Form.Group className="mb-3" controlId="inn">
                        <Form.Label>ИНН</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="10-12 цифр"
                            maxLength={12}
                            onChange={onChangeInn}
                            value={data.inn}
                            onKeyUp={onKeyUp}
                            style={data.inn.length>0?{}:{borderColor:'red'}}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="kpp">
                        <Form.Label>КПП</Form.Label>
                        <Form.Control type="text" placeholder="9 цифр" maxLength={9} onChange={changeInput} value={data.kpp} onKeyUp={onKeyUp} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Название</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={changeInput}
                            value={data.name}
                            style={data.name.length>0?{}:{borderColor:'red'}}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Телефон</Form.Label>
                        <Form.Control type="text" onChange={changeInput} value={data.phone}/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="addr">
                        <Form.Label>Юр. адрес</Form.Label>
                        <Form.Control as="textarea" rows={3} onChange={changeInput} value={data.addr} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="dir">
                        <Form.Label>Руководитель</Form.Label>
                        <Form.Control type="text" onChange={changeInput}  value={data.dir}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="staff">
                        <Form.Label>Должность руководителя</Form.Label>
                        <Form.Control type="text" onChange={changeInput}  value={data.staff}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="buh">
                        <Form.Label>Бухгалтер</Form.Label>
                        <Form.Control type="text" onChange={changeInput}  value={data.buh}/>
                    </Form.Group>
                </Col>
             </Row>
        </>
    );

    const validate = () => {
        if(data.inn.length===0) return false;
        if (data.fio.length===0&&data.name.length===0)return false;
        return true;
    }

    const saveClient = () => {
        if(validate())
        {
            if(params.id)
            {
                ClientService.update(
                    data,
                    params.id
                ).then(
                    response => {

                    },
                    error => {
                        setError(error, setFormErrors);
                    }
                );
            }
            else
            {
                ClientService.add(
                    data
                ).then(
                    response => {
                        if(response.data.user) navigate(`${config._install_path}clients/${response.data.user.id}`);
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
        <Container>
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
                            <Form.Group className="mb-3">
                                <Form.Label>Введите ФИО, название или ИНН</Form.Label>
                                <PartySuggestions
                                    token={config._dadataToken}
                                    onChange={(event) => onChange(event)}
                                    count={5}
                                    minChars={3}
                                    inputProps={{placeholder:`Введите ФИО или название в свободной форме, ИНН или ОГРН`,
                                                id: 'customer'}}
                                    value="" />
                            </Form.Group>

                            {(data.formReg==="1"? customerFL : customerUL)}
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
                            <div>
                                <Button onClick={saveClient}>Сохранить</Button>
                            </div>
                            {params.id? <ClientAcc clientId={params.id}/>: null}
                        </>
                    ):
                    (
                         <>
                            <div>
                                <Button onClick={addNewClient}>Добавить</Button>
                                <Tooltip id="button-tooltip" />
                            </div>
                            {isLoaded
                                ? <Spinner/>
                                : null
                            }

                            <table className='table table-striped table-hover'>
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>ИНН</th>
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
                                title="удалить клиента"
                                deletedId={deletedId}
                                deleteFunc={deleteElement}
                            />
                        </>
                    )
                }
            </div>
        </Container>
    );
}
