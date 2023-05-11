import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Row, Col, Stack, Button } from 'react-bootstrap';
import axios from 'axios';
import { ArrowLeft } from 'react-bootstrap-icons';

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';
import Products from './products.component.jsx';
import Contr from './contr.component.jsx';
import DropdownPrint from './dropdown.component.jsx';

import DocService from "../services/doc.service";
import FirmService from '../services/firm.service';
import FirmAccService from '../services/firm.acc.service';
import ProductService from '../services/product.service';

import { onKeyUp, changeProducts, addItem, deleteItem, changeInput, setError } from "../services/functions";

import config from "../services/config";
import messages from '../services/messages';
import { debug } from '../services/functions';

import 'react-dadata/dist/react-dadata.css';

export default function DocEdit () {
    const [formErrors, setFormErrors] = useState([]);
    const [success, setSuccess] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState("Добавление документа");
    const [dataItems, setDataItems] = useState();
    const [dataAccItems, setDataAccItems] = useState();

    const navigate = useNavigate();
    const params = useParams();

    const [data, setData] = useState(() => {
        //2017-06-01
        let now = new Date();
        let day_temp = (now.getDate()>=10 ? `${now.getDate()}`: `0${now.getDate()}`)
        let month_temp = ((now.getMonth()+1)>=10 ? `${now.getMonth()+1}` : `0${now.getMonth()+1}`);

        return {
            id: 0,
            num: 1,
            date: `${now.getFullYear()}-${month_temp}-${day_temp}`,
            comment: "",
            ndsType: "1",
            selfFormReg: "1",
            selfInn: "",
            selfFio: "",
            selfAddr: "",
            selfBank: "",
            selfBankCity: "",
            selfRS: "",
            selfBIK: "",
            selfKS: "",
            selfKpp: "",
            selfName: "",
            selfrDir: "",
            selfStaff: "",
            selfPhone: "",
            selfBuh: "",
            formReg: "1",
            inn:"",
            fio:"",
            addr:"",
            kpp:"",
            name: "",
            bank: "",
            rs:"",
            bik: "",
            ks: "",
            dir: "",
            staff: "",
            bankCity: "",
            phone: "",
            buh: "",
            selfId: 0,
            contrId: 0,
            sum: 0
        }
    })

    const [products, setProducts] = useState(() => {
        return [{
            id: 1,
            name: "",
            count: 0,
            measure: "",
            price: 0,
            nds: 0,
            sum: 0
        }]
    })

    useEffect(() => {
        FirmService.getList()
            .then(
                response => {
                    let defFirmId = 0;
                    const tempDataItems = response.data.data.map((item, i) => {
                        if(i===0) defFirmId = item.id;
                        if(item.is_default) defFirmId = item.id;
                        return (
                            <option key={i} value={item.id}>{item.form_reg==='1'? item.f_fio:item.f_name}</option>
                        )
                    });
                    setDataItems(tempDataItems);

                    if(params.id)
                    {
                        setTitle("Редактирование документа");
                        DocService.get(
                            params.id
                        ).then(
                            response => {
                                const one = response.data.data[0];

                                const date = (one.date? `${one.date.substring(6, 10)}-${one.date.substring(3, 5)}-${one.date.substring(0, 2)}`: "");

                                setData({
                                    id: params.id,
                                    num: one.num,
                                    date: date,
                                    comment: one.comment,
                                    ndsType: one.nds_type,
                                    selfFormReg: one.reg_form_self,
                                    selfInn: one.inn_self,
                                    selfFio: (one.reg_form_self==="1"? one.name_self: ""),
                                    selfAddr: one.addr_self,
                                    selfBank: one.bank_self,
                                    selfBankCity: one.bank_city_self,
                                    selfRS: one.rs_self,
                                    selfBIK: one.bik_self,
                                    selfKS: one.ks_self,
                                    selfKpp: one.kpp_self,
                                    selfName: (one.reg_form_self==="1"? "": one.name_self),
                                    selfDir: one.staff_self,
                                    selfStaff: one.staff_job_self,
                                    selfPhone: one.phone_self,
                                    selfBuh: one.buh_self,
                                    formReg: one.reg_form,
                                    inn: one.inn,
                                    fio: (one.reg_form==="1"? one.name: ""),
                                    addr: one.addr,
                                    kpp: one.kpp,
                                    name: (one.reg_form==="1"? "": one.name),
                                    bank: one.bank,
                                    rs: one.rs,
                                    bik: one.bik,
                                    ks: one.ks,
                                    dir: one.staff,
                                    staff: one.staff_job,
                                    bankCity: one.bank_city,
                                    phone: one.phone,
                                    buh: one.buh
                                });
                                ProductService.getList(params.id).then(
                                    response => {
                                        setProducts([]);

                                        response.data.data.map(item => {
                                            addItem(setProducts, item);
                                            return item
                                        });
                                        setIsLoaded(false);
                                    },
                                    error => {
                                        setIsLoaded(false);
                                        setError(error, setFormErrors);
                                    }
                                )
                            },
                            error => {
                                setIsLoaded(false);
                                setError(error, setFormErrors);
                            }
                        );
                    }
                    else
                    {
                        setTitle("Добавление документа");
                        lastNum();
                        if(defFirmId) {
                            loadFirm(defFirmId);
                            loadAccSelect(defFirmId)
                        }
                    }
                },
                error => {
                    setError(error, setFormErrors);
                }
            );

    }, [])

    const lastNum = (inn) => {
        DocService.lastNum(inn).then(
            response => {
                if(response.data){
                    if(response.data.data.length>0)
                    {
                        setData(prev => {
                            return {
                                ...prev,
                                num: +response.data.data[0].num + 1
                            }
                        })
                    }
                    else
                    {
                        setData(prev => {

                            return {
                                ...prev,
                                num: 1
                            }
                        })
                    }
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onChange = (event, id) => {
        if(event.value)
        {
            if(id==="customer")
            {
                setData(prev => {

                    return {
                        ...prev,
                        inn: event.data.inn,
                        fio: event.data.name.full,
                        addr: event.data.address.unrestricted_value,
                        kpp: event.data.kpp,
                        name: event.data.name.full,
                        formReg: (event.data.type==="LEGAL"? "2":"1"),
                        staff: ( event.data.management? event.data.management.post:""),
                        dir: ( event.data.management?event.data.management.name:"")
                    }
                })
            }
        }
    }

    const validate = () => {
        if(products.length===0||products[0].name.length===0||products[0].count<=0) return false;
        if(data.selfInn.length===0||data.inn===0) return false;
        return true;
    }

    const onChangeBik = (event) => {
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
                        if(event.target.id==="bik")
                        {
                            setData(prev => {
                                return {
                                    ...prev,
                                    bank: obj.suggestions[0].unrestricted_value,
                                    ks: obj.suggestions[0].data.correspondent_account,
                                    bankCity: obj.suggestions[0].data.payment_city,
                                }
                            })
                        }
                        if(event.target.id==="selfBIK")
                        {
                            setData(prev => {
                                return {
                                    ...prev,
                                    selfBank: obj.suggestions[0].unrestricted_value,
                                    selfKS: obj.suggestions[0].data.correspondent_account,
                                    selfBankCity: obj.suggestions[0].data.payment_city,
                                }
                            })
                        }
                    }

                    setIsLoaded(false);
                })
                .catch(error => debug(error));
        }
    }

    const reorgData = (data) => {
        let day, month, date2;
        if(data.date){
            date2 = new Date(data.date);
            day = (date2.getDate()>=10 ? `${date2.getDate()}`: `0${date2.getDate()}`)
            month = ((date2.getMonth()+1)>=10 ? `${date2.getMonth()+1}` : `0${date2.getMonth()+1}`)
        }
        let docDate;
        if(day) docDate = `${day}.${month}.${date2.getFullYear()}`;
        else docDate = "";
        return {
            id: data.id,
            num: data.num,
            date: docDate,
            nds_type: "1",
            comment: data.comment,
            inn_self: data.selfInn,
            kpp_self: data.selfKpp,
            name_self: data.selfFormReg==="1"? data.selfFio:data.selfName,
            phone_self: data.selfPhone,
            addr_self: data.selfAddr,
            buh_self: data.selfBuh,
            staff_self: data.selfDir,
            staff_job_self: data.selfStaff,
            bik_self: data.selfBIK,
            bank_self: data.selfBank,
            bank_city_self: data.selfBankCity,
            rs_self: data.selfRS,
            ks_self: data.selfKS,
            reg_form_self: data.selfFormReg,
            inn: data.inn,
            kpp: data.kpp,
            name: data.formReg==="1"? data.fio:data.name,
            phone: data.phone,
            addr: data.addr,
            buh: data.buh,
            staff: data.dir,
            staff_job: data.staff,
            bik: data.bik,
            bank: data.bank,
            bank_city: data.bankCity,
            rs: data.rs,
            ks: data.ks,
            reg_form: data.formReg,
            sum: sumWithNDS,
            self_id: data.selfId,
            contr_id: data.contrId
        }
    }

    const saveDoc = () => {
        setIsLoaded(true);
        if(validate())
        {
            if(data.id)
            {
                console.log(data)
                DocService.update(
                    reorgData(data)
                ).then(
                    response => {
                        setSuccess([response.data.message])
                        ProductService.delete_all(data.id).then(
                            response => {
                                ProductService.add(products, data.id).then(
                                    response => {
                                        response.data.product.map(item => {
                                            const id = item.id;
                                            const table_id = item.table_id;
                                            setProducts(prev => {
                                                const new_products = prev.map(item => {
                                                    if(item.id === id){
                                                        return {...item, table_id: table_id}
                                                    }
                                                    return item;
                                                })
                                                return new_products;
                                            });
                                            return item;
                                        });
                                        setIsLoaded(false);
                                    },
                                    error => {
                                        setIsLoaded(false);
                                        setError(error, setFormErrors);
                                    }
                                )
                            },
                            error => {
                                setIsLoaded(false);
                                setError(error, setFormErrors);
                            }
                        );

                    },
                    error => {
                        setError(error, setFormErrors);
                        setIsLoaded(false);
                    }
                );
            }
            else
            {
                DocService.add(
                    reorgData(data)
                ).then(
                    response => {
                        setSuccess(["Документ добавлен"])
                        setData(prev => {
                            return {
                                ...prev,
                                id: response.data.doc.id
                            }
                        })

                        ProductService.add(products, response.data.doc.id).then(
                            response => {
                                response.data.product.map(item => {
                                    const id = item.id;
                                    const table_id = item.table_id;
                                    setProducts(prev => {
                                        const new_products = prev.map(item => {
                                            if(item.id === id){
                                                return {...item, table_id: table_id}
                                            }
                                            return item;
                                        })
                                        return new_products;
                                    });
                                    return item;
                                });
                                setIsLoaded(false);
                            },
                            error => {
                                setIsLoaded(false);
                                setError(error, setFormErrors);
                            }
                        )
                    },
                    error => {
                        setIsLoaded(false);
                        setError(error, setFormErrors);
                    }
                );
            }
        }
        else{
            setIsLoaded(false);
            setFormErrors([messages.EMPTY_FORM]);
        }
    }

    let sumWithoutNDS = 0;
    let sumNDS = 0;
    let sumWithNDS = 0;

    const dataProduct = products.map((item, i) => {
        sumWithoutNDS+= Math.floor(Number(item.price)*Number(item.count) * 100) / 100;
        sumNDS+= ((Number(item.price)*Number(item.count)*Number(item.nds))/100);
        sumWithNDS+= Math.floor(Number(item.sum) * 100) / 100;
        return {
            num: (i + 1),
            name: item.name,
            count: item.count,
            measure: item.measure,
            price: item.price,
            sum: item.sum,
            nds: item.nds
        };
    })

    const loadFirm = (firmId) => {
        return FirmService.get(firmId).then(
            response => {
                if(response.data.data)
                {
                    const one = response.data.data[0]
                    if(one)
                    {
                        setData(prev => {
                            return {
                                ...prev,
                                selfInn: one.f_inn,
                                selfFio: one.f_fio,
                                selfPhone: one.f_phone,
                                selfAddr: one.f_addr,
                                selfKpp: one.f_kpp,
                                selfName: one.f_name,
                                selfDir: one.f_dir,
                                selfStaff:  one.f_dir_staff,
                                selfFormReg: one.form_reg,
                                seflBuh: one.f_buh
                            }
                        })
                        lastNum(one.f_inn);
                    }
                    else{
                        setData(prev => {
                            return {
                                ...prev,
                                selfInn: "",
                                selfFio: "",
                                selfPhone: "",
                                selfAddr: "",
                                selfKpp: "",
                                selfName: "",
                                selfDir: "",
                                selfStaff: "",
                                selfFormReg: "",
                                seflBuh: ""
                            }
                        })
                    }
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const loadAcc = (id) => {
        FirmAccService.get(id).then(
            response => {
                if(response.data.data&&response.data.data.length>0)
                {
                    const one = response.data.data[0]
                    setData(prev => {
                        return {
                            ...prev,
                            selfBank: one.a_bank,
                            selfBankCity: one.a_gorod_bank,
                            selfRS: one.a_rs,
                            selfBIK: one.a_bik,
                            selfKS: one.a_ks
                        }
                    })
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const goBack = () => {
        navigate(`${config._install_path}docs`);
    }

    const loadAccSelect = (firmId) => {
        FirmAccService.getList(firmId).then(
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
                if(params.id){
                    //
                }
                else{
                    loadAcc(defAccId);
                }
            },
            error => {
                setError(error, setFormErrors);
            }
        );
    }

    const onChangeFirmSelect = (event) => {
        setData(prev => {
            return {
                ...prev,
                selfId: event.target.value,
            }
        })
        loadFirm(event.target.value);
        loadAccSelect(event.target.value);
        changeInput(event, setData);
    }

    const onChangeBikSelect = (event) => {
        loadAcc(event.target.value);
        changeInput(event, setData);
    }

    const onChangeInn = (event) => {
        event.persist();
        setData(prev => {
            return {
                ...prev,
                [event.target.id]: event.target.value,
            }
        })

        if(event.target.value.length>=10) {
            setIsLoaded(true);

            const query = event.target.value;

            const options = {
                url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
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
                        const one = obj.suggestions[0].data;
                        console.log(one)
                        if(event.target.id==="selfInn")
                        {
                            setData(prev => {
                                return {
                                    ...prev,
                                    selfInn: one.inn,
                                    selfFio: one.type==="LEGAL"? '' : one.name.full,
                                    selfAddr: one.address? one.address.unrestricted_value:'',
                                    selfKpp: one.kpp,
                                    selfName: one.type==="LEGAL"? one.name.full : '',
                                    selfDir:one.management? one.management.name: '',
                                    selfStaff: one.management? one.management.post: '',
                                    selfFormReg: one.type==="LEGAL"? "2" : "1",
                                }
                            })
                        }
                        if(event.target.id==="inn")
                        {
                            setData(prev => {
                                return {
                                    ...prev,
                                    inn: one.inn,
                                    fio: one.type==="LEGAL"? '' : one.name.full,
                                    addr: one.address? one.address.unrestricted_value:'',
                                    kpp: one.kpp,
                                    name: one.type==="LEGAL"? one.name.full : '',
                                    dir: one.management? one.management.name: '',
                                    staff: one.management? one.management.post: '',
                                    formReg: one.type==="LEGAL"? "2" : "1",
                                }
                            })
                        }
                    }

                    setIsLoaded(false);
                })
                .catch(error => {
                    setError(error, setFormErrors);
                });
        }
    }

    const bank = (
        <>
            <Form.Group className="mb-3" controlId="selfAcc">
                <Form.Label>Банковские реквизиты</Form.Label>
                <Form.Select aria-label="Выберите из списка" onChange={onChangeBikSelect} className="btn btn-secondary">
                    <option key={0} value={0}>-- Выберите из списка --</option>
                    {dataAccItems}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfBIK">
                <Form.Label>БИК</Form.Label>
                <Form.Control
                    type="text"
                    maxLength={9}
                    placeholder="9 цифр"
                    value={data.selfBIK}
                    onKeyUp={onKeyUp}
                    onChange={onChangeBik}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfBank">
                <Form.Label>Банк</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfBank} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfBankCity">
                <Form.Label>Город банка</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfBankCity} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfRS">
                <Form.Label>Расчётный счёт</Form.Label>
                <Form.Control type="text" maxLength={20} placeholder="20 цифр" onChange={(event) => changeInput(event, setData)} value={data.selfRS} onKeyUp={onKeyUp} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfKS">
                <Form.Label>Корр. счёт</Form.Label>
                <Form.Control type="text" maxLength='20' placeholder='20 цифр' onChange={(event) => changeInput(event, setData)} value={data.selfKS} onKeyUp={onKeyUp} />
            </Form.Group>
        </>
    )

    const selfFL = (
        <>
            <Form.Group className="mb-3" controlId="selfInn">
                <Form.Label>ИНН</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="12 цифр"
                    value={data.selfInn}
                    onKeyUp={onKeyUp}
                    onChange={onChangeInn}
                    style={data.selfInn.length>0?{}:{borderColor:'red'}}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfFio">
                <Form.Label>ФИО</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfFio} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfPhone">
                <Form.Label>Телефон</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfPhone}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfAddr">
                <Form.Label>Адрес</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)} value={data.selfAddr}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfBuh">
                <Form.Label>Бухгалтер</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfBuh}/>
            </Form.Group>
            {bank}
        </>
    )

    const selfUL = (
        <>
            <Form.Group className="mb-3" controlId="selfInn">
                <Form.Label>ИНН</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="10 цифр"
                    value={data.selfInn}
                    onKeyUp={onKeyUp}
                    onChange={onChangeInn}
                    required
                    style={data.selfInn.length>0?{}:{borderColor:'red'}}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfKpp">
                <Form.Label>КПП</Form.Label>
                <Form.Control type="text" placeholder="9 цифр" maxLength={9} onChange={(event) => changeInput(event, setData)} value={data.selfKpp}  onKeyUp={onKeyUp}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfName">
                <Form.Label>Название</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)}  value={data.selfName}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfPhone">
                <Form.Label>Телефон</Form.Label>
                <Form.Control type="text"  onChange={(event) => changeInput(event, setData)} value={data.selfPhone}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfAddr">
                <Form.Label>Юр. адрес</Form.Label>
                <Form.Control as="textarea" rows={3}  onChange={(event) => changeInput(event, setData)} value={data.selfAddr}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfDir">
                <Form.Label>Руководитель</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)}  value={data.selfDir}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfStaff">
                <Form.Label>Должность руководителя</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)}  value={data.selfStaff}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="selfBuh">
                <Form.Label>Бухгалтер</Form.Label>
                <Form.Control type="text" onChange={(event) => changeInput(event, setData)} value={data.selfBuh}/>
            </Form.Group>
            {bank}
        </>
    )

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
                {success.length
                    ? <Alert type="success" messages={success} />
                    : null
                }

                <Form>
                    {isLoaded? <Spinner/>:null}
                    <Row>
                        <Col xs={12} sm={12} md={6} >
                            <Form.Group className="mb-3" controlId="num">
                                <Stack direction="horizontal" gap={2}>
                                    <Form.Label className="label_min_width">Документ №</Form.Label>
                                    <Form.Control type="text" value={data.num} onChange={(event) => changeInput(event, setData)}  style={{maxWidth:"200px"}} />
                                </Stack>
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={12} md={6} >
                            <Form.Group className="mb-3" controlId="date">
                                <Stack direction="horizontal" gap={2}>
                                    <Form.Label>от</Form.Label>
                                    <Form.Control type="date" value={data.date} onChange={(event) => changeInput(event, setData)} style={{maxWidth:"200px"}} />
                                </Stack>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mt-5'>
                        <Col xs={12} sm={12} md={6}>
                            <h2>Моя компания</h2>

                            <Form.Group className="mb-3" controlId="self">
                                <Form.Label>Реквизиты</Form.Label>
                                <Form.Select aria-label="Выберите из списка" onChange={onChangeFirmSelect} className="btn btn-secondary">
                                    <option key={0} value={0}>-- Выберите из списка --</option>
                                    {dataItems}
                                </Form.Select>
                            </Form.Group>

                            {(data.selfFormReg==="1"? selfFL : selfUL)}
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <Contr
                                changeInput={changeInput}
                                data={data}
                                onKeyUp={onKeyUp}
                                onChangeBik={onChangeBik}
                                onChange={onChange}
                                token={config._dadataToken}
                                setData={setData}
                                onChangeInn={onChangeInn} />
                        </Col>
                    </Row>
                    <Row className='mt-5'>
                        <Col>
                            <Row>
                                <h4>Товары и услуги</h4>
                            </Row>
                            <Products changeProducts={changeProducts} data={products} deleteItem={deleteItem} setProducts={setProducts}/>
                        </Col>
                    </Row>
                    <Row className='mt-5 mb-5'>
                        <Col>
                        Общая сумма
                        </Col>
                        <Col>
                            <Row>
                                <Col>
                                без НДС
                                </Col>
                                <Col>
                                {(parseInt(sumWithoutNDS * 100)) / 100}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                НДС
                                </Col>
                                <Col>
                                {(parseInt(sumNDS * 100)) / 100}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                Итого с НДС
                                </Col>
                                <Col>
                                {(parseInt(sumWithNDS * 100)) / 100}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="comment">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)} value={data.comment} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{position: 'relative'}}>
                            {isLoaded? <Spinner/>:null}
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={goBack}>
                                Выйти
                            </Button>
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={saveDoc}>
                                Сохранить
                            </Button>
                            <div style={{display: 'flex'}}>
                                {params.id||data.id?
                                    <>
                                        <DropdownPrint doc_id={params.id?params.id:data.id} type="docx"/>
                                        <DropdownPrint doc_id={params.id?params.id:data.id} type="pdf"/>
                                    </>
                                    :
                                    null
                                }
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
}
