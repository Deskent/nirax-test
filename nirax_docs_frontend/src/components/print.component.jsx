import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Form, Row, Col, Stack, Button } from 'react-bootstrap';
import { rubles } from 'rubles';
import { ArrowLeft } from 'react-bootstrap-icons';

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import DocPrintService from "../services/doc.print.service";
import DocService from "../services/doc.service";
import ProductService from "../services/product.service";
import ShablonService from "../services/shablon.service";

import { createAndDownloadDocx, createAndDownloadPdf, changeInput, setError } from "../services/functions";

import messages from '../services/messages';

export default function DocPrint () {
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

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
            type: searchParams.get('type'),
            ext: searchParams.get('ext'),
            doc_id: searchParams.get('doc_id')
        }
    })

    useEffect(() => {
        setIsLoaded(true);
        DocPrintService.get(
            searchParams.get('type'),
            searchParams.get('doc_id'),
            searchParams.get('ext')
        ).then(
            response => {
                const one = response.data.data[0];
                if(one!== undefined)
                {
                    setData(prev => {

                        return {
                            ...prev,
                            id: one.id,
                            num: one.num,
                            date: one.date,
                            comment: one.comment,
                            data: one.data
                        }
                    });
                }
                else
                {
                    DocService.get(
                        searchParams.get('doc_id')
                    ).then(
                        response => {
                            const one = response.data.data[0];
                            setData(prev => {

                                return {
                                    ...prev,
                                    num: one.num,
                                }
                            });
                        })
                    reformatData(searchParams.get('doc_id'));
                }
                setIsLoaded(false)
                reformatData(searchParams.get('doc_id'));
            },
            error => {
                setIsLoaded(false);
                setError(error, setFormErrors);
            }
        );

    }, [])

    const validate = () => {
        if(data.num.length===0||data.date.length===0) return false;
        return true;
    }

    const reformatData = (doc_id) => {
        DocService.get(
            doc_id
        ).then(
            response => {
                const one = response.data.data[0];

                ProductService.getList(searchParams.get('doc_id')).then(
                    response => {
                        const product = response;
                        ShablonService.get(searchParams.get('type')).then(
                            response => {
                                let sumWithoutNDS = 0;
                                let sumNDS = 0;
                                let sumWithNDS = 0;

                                const prod = product.data.data.map((item, i) => {
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
                                        nds_pro: item.nds,
                                        nds: Math.floor(100*(Number(item.price)*Number(item.count)*Number(item.nds))/100)/100,
                                        sum_w_nds: Math.floor(Number(item.price)*Number(item.count) * 100) / 100
                                    };
                                });

                                const propis = (sumWithNDS>0? rubles(sumWithNDS): "0");

                                let tempData = {
                                    file: (response.data.data.length>0? response.data.data[0].file: ''),
                                    file_name: Math.random(),
                                    self_bank: one.bank_self,
                                    self_bank_city: one.bank_city_self,
                                    self_bik: one.bik_self,
                                    self_ks: one.ks_self,
                                    self_inn: one.inn_self,
                                    self_w_kpp: one.kpp_self? one.kpp_self: "",
                                    self_rs: one.rs_self,
                                    self_name: one.name_self,
                                    self_form: one.reg_form_self==="1"? ' ИП ': ' ООО ',
                                    self_kpp: one.kpp_self? ' КПП ' + one.kpp_self: "",
                                    self_addr: one.addr_self,
                                    self_tel: one.phone_self,
                                    form: one.reg_form==="1"? ' ИП ':  ' ООО ',
                                    name: one.name,
                                    inn: one.inn,
                                    kpp: one.kpp? one.kpp: "",
                                    addr: one.addr,
                                    tel: one.phone,
                                    t: prod,
                                    sum: (parseInt(sumWithoutNDS * 100)) / 100,
                                    nds: (parseInt(sumNDS * 100)) / 100,
                                    itogo: (parseInt(sumWithNDS * 100)) / 100,
                                    itogo_sum_r: `${(parseInt(sumWithNDS * 100)) / 100} p.`,
                                    count_num: prod.length,
                                    sum_prop: propis.charAt(0).toUpperCase() + propis.slice(1),
                                    self_dir_staff: one.staff_job_self? one.staff_job_self: " Руководитель ",
                                    self_dir: one.staff_self,
                                    self_ip: one.reg_form_self==='1'? ' ИП ': '',
                                    self_buh: one.buh_self,
                                    rs: one.rs,
                                    bank: one.bank,
                                    bik: one.bik,
                                    ks: one.ks,
                                    self_job: one.reg_form_self==='1'? one.name_self: one.staff_job_self + ' ' + one.staff_self,
                                    ip: one.reg_form==='1'? ' ИП ': '',
                                    job: one.reg_form==='1'? one.name: one.staff_job + ' ' + one.staff,
                                    self_job_fio: one.reg_form_self==='1'? one.name_self: one.staff_self,
                                    job_fio: one.reg_form==='1'? one.name: one.staff,
                                };
                                setData(prev => {
                                    return {
                                        ...prev,
                                        data: JSON.stringify(tempData)
                                    }
                                })
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
                )
            },
            error => {
                setIsLoaded(false);
                setError(error, setFormErrors);
            }
        );
    }

    const printDoc = (data) =>
    {
        const data2 = JSON.parse(data.data);
        data2.num = data.num;
        data2.comment = data.comment;

        let day = '', month = '', date2 = '';

        if(data.date){
            date2 = new Date(data.date);
            day = (date2.getDate()>=10 ? `${date2.getDate()}`: `0${date2.getDate()}`)
            month = ((date2.getMonth()+1)>=10 ? `${date2.getMonth()+1}` : `0${date2.getMonth()+1}`)
        }
        let docDate;
        if(day) docDate = `${day}.${month}.${date2.getFullYear()}`;
        else docDate = "";
        data2.date = docDate;
        data2.day = day;
        data2.month = month;
        data2.year = date2?date2.getFullYear():'';

        if(searchParams.get('ext')==="docx") createAndDownloadDocx(validate, setIsLoaded, data2, searchParams.get('type'))
        if(searchParams.get('ext')==="pdf") createAndDownloadPdf(validate, setIsLoaded, data2, searchParams.get('type'))
    }

    const saveDoc = () => {
        setIsLoaded(true);
        if(validate())
        {
            if(data.id)
            {
                DocPrintService.update(
                    data
                ).then(
                    response => {
                        printDoc(data)
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
                DocPrintService.add(
                    data
                ).then(
                    response => {
                        setIsLoaded(false);
                        printDoc(data)
                        setData(prev => {
                            return {
                                ...prev,
                                id: response.data.doc.id
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
            setIsLoaded(false);
        }
    }

    const goBack = () => {
        //navigate(`${config._install_path}docs/${searchParams.get('doc_id')}`);
        navigate(-1);
    }

    return (
        <div className="container">
            <header className="jumbotron">
                <h1>Формирование печатной формы документа</h1>
            </header>
            <Button variant='link' onClick={goBack}><ArrowLeft color="#0b5ed7"/>Назад</Button>
            <div>
                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
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

                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="comment">
                                <Form.Label>Комментарий</Form.Label>
                                <Form.Control as="textarea" rows={3} onChange={(event) => changeInput(event, setData)} value={data.comment} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{position: 'relative'}}>
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={goBack}>
                                Выйти
                            </Button>
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={saveDoc}>
                                Сформировать
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
}
