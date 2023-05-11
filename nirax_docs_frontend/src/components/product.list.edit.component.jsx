import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Fragment } from 'react';

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import ProductsService from '../services/products.service';

import { changeProducts, addItem, setError } from "../services/functions";

import config from "../services/config";
import messages from '../services/messages';

import 'react-dadata/dist/react-dadata.css';

export default function ProductListEdit () {
    const [formErrors, setFormErrors] = useState([]);
    const [success, setSuccess] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState("Добавление товара/услуги");

    const navigate = useNavigate();
    const params = useParams();

    const [products, setProducts] = useState(() => {
        return [{
            id: 0,
            name: "",
            measure: "",
            price: 0,
            nds: 0,
        }]
    })

    useEffect(() => {

        if(params.id)
        {
            setTitle("Редактирование товара/услуги");

            ProductsService.get(params.id).then(
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
        }
        else
        {
            setTitle("Добавление товара/услуги");
        }
    }, [])

    const validate = () => {
        if(products.length===0||products[0].name.length===0) return false;
        return true;
    }

    const saveProduct = () => {
        setIsLoaded(true);
        if(validate())
        {
            if(params.id||products[0].id>0)
            {
                ProductsService.update(products[0]).then(
                    response => {
                        console.log(response)
                        setSuccess([response.data.message])
                        setIsLoaded(false);
                    },
                    error => {
                        setIsLoaded(false);
                        setError(error, setFormErrors);
                    }
                )
            }
            else
            {
                ProductsService.add(products).then(
                    response => {
                        setSuccess([response.data.message])
                        setProducts([]);

                        response.data.product.map(item => {
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
            }
        }
        else{
            setIsLoaded(false);
            setFormErrors([messages.EMPTY_FORM]);
        }
    }

    const goBack = () => {
        navigate(`${config._install_path}products`);
    }

    const rows = products.map((item, i) => {
        let labelDisplay = "";
        if(i>0) labelDisplay = "d-lg-none";
        return (
            <Fragment key={item.id}>
                <Row>
                    <Col xs={12} sm={6} md={3} xl={4}>
                        <Form.Group className="mb-3" controlId="productStrName1">
                            <Form.Label className={labelDisplay}>Название</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(event) => {changeProducts(item.id, 'name', event, setProducts)}}
                                value={item.name}
                                style={item.name.length>0?{}:{borderColor:'red'}}/>
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={2} lg={1}>
                        <Form.Group className="mb-3" controlId="productStrMeasure1">
                            <Form.Label className={labelDisplay}>Е/изм.</Form.Label>
                            <Form.Control type="text" onChange={(event) => {changeProducts(item.id, 'measure', event, setProducts)}} value={item.measure}/>
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={3} lg={2}>
                        <Form.Group className="mb-3" controlId="productStrPrice1">
                            <Form.Label className={labelDisplay}>Цена</Form.Label>
                            <Form.Control type="number" placeholder="0,00" step="0.01" onChange={(event) => {changeProducts(item.id, 'price', event, setProducts)}} value={item.price} />
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={3} lg={2}>
                        <Form.Group className="mb-3" controlId="productStrNDS1">
                            <Form.Label className={labelDisplay}>в т.ч. НДС</Form.Label>
                            <Form.Select aria-label="Выберите тип НДС " value={item.nds} onChange={(event) => {changeProducts(item.id, 'nds', event, setProducts)}}>
                                <option value="0">Без НДС</option>
                                <option value="10">10%</option>
                                <option value="18">18%</option>
                                <option value="20">20%</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <hr className="d-lg-none"/>
            </Fragment>
        )
    })

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
                    <Row className='mt-5'>
                        <Col>
                            {rows}
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{position: 'relative'}}>
                            {isLoaded? <Spinner/>:null}
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={goBack}>
                                Выйти
                            </Button>
                            <Button variant="primary" style={{float: 'right'}} className="m-2" onClick={saveProduct}>
                                Сохранить
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
}
