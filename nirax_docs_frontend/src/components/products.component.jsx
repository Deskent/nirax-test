import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import { TrashFill, XCircle } from 'react-bootstrap-icons';
import { Fragment, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useRef } from 'react';

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import { setError } from "../services/functions";
import { addItem } from '../services/functions';

import ProductsService from "../services/products.service";

import 'react-tooltip/dist/react-tooltip.css';

export default function Products({changeProducts, deleteItem, data, setProducts}){
    const [selectItems, setSelectItems] = useState();
    const [selectedItems, setSelectedItems] = useState([]);
    const [display, setDisplay] = useState('none');
    const [isLoaded, setIsLoaded] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [suggestDisplay, setSuggestDisplay] = useState(0);
    const [suggestData, setSuggestData] = useState(0);

    const inputRef = useRef([]);
    const checkRef = useRef([]);

    const addSelectItem = (id, items, event) => {
        if(event.target.checked===true)
        {
            const tempItems = items.filter(item => item.id === id);

            if(tempItems.length>0)
            {
                setSelectedItems(prev => {
                    const new_products = [...prev, ...tempItems]
                    return new_products;
                })
            }
        }
        else{
             setSelectedItems(prev => {
                return prev.filter(item => item.id !== id);
            })
        }
    }

    const selectItem = () => {
        checkRef.current.map(item => item.checked = false);

        setSelectedItems([]);
        setIsLoaded(true);
        ProductsService.getList().then(
            response => {
                setIsLoaded(false);

                if(response.data.data&&response.data.data.length>0){
                    setDisplay(true)
                    const tempDataItems = response.data.data.map((item, i) => {
                        return (
                            <Row key={i} tabIndex={0} className="border-bottom pb-2">
                                <Col>
                                    <Form.Check
                                        type="checkbox"
                                        id={`cb-${item.id}`}
                                        label={``}
                                        onChange={(event) => addSelectItem(item.id, response.data.data, event)}
                                        ref={el => checkRef.current[item.id] = el}
                                    />
                                </Col>
                                <Col>{item.name}</Col>
                                <Col>{item.price}</Col>
                                <Col>{item.nds}</Col>
                            </Row>
                        )
                    });
                    setSelectItems(tempDataItems);
                }
                else
                {
                    setSelectItems([]);
                }
            },
            error => {
                setError(error, setFormErrors);
                setIsLoaded(false)
            }
        );
    }

    const addSelectedItems = (event) => {
        if(data.length===1&&data[0].name.length===0) deleteItem(data[0].id, setProducts);
        event.preventDefault();
        setSuggestDisplay(0);
        setDisplay('none');

        selectedItems.map((item) => {
            addItem(setProducts, {
                id: item.id,
                name: item.name,
                count: 0,
                measure: item.measure,
                price: item.price,
                nds: item.nds,
                sum: 0
            });

            return item;
        })
    }

    const selectFromSuggestion = (id, item) => {
        deleteItem(id, setProducts);
        addItem(setProducts, {
            id: id,
            name: item.name,
            count: 0,
            measure: item.measure,
            price: item.price,
            nds: item.nds,
            sum: 0
        });
        setSuggestDisplay(0);
        const next = inputRef.current[id];
        if (next) {
            next.focus()
        }
    }

    const suggestion = (event, id) => {
        setSuggestDisplay(0);
        if(event.target.value.length>3)
        {
            ProductsService.getLike(event.target.value).then(
                response => {
                    setIsLoaded(false);

                    if(response.data.data&&response.data.data.length>0){
                        const tempDataItems = response.data.data.map((item, i) => {
                            return (
                                <Row key={i} tabIndex={0} className="border-bottom pt-1 pb-1">
                                    <Col>{item.name}</Col>
                                    <Col>{item.price}</Col>
                                    <Col>{item.nds}</Col>
                                    <Col>
                                        <Button onClick={() => selectFromSuggestion(id, item)}>Выбрать</Button>
                                    </Col>
                                </Row>
                            )
                        });
                        const tempSuggestData = (
                            <Container className='border mx-3 px-3 rounded pt-3' style={{position: 'absolute', background: '#fff', zIndex: 2}}>
                                <XCircle color="#0b5ed7" onClick={() => setSuggestDisplay(0)} style={{cursor: 'pointer', position: 'absolute', right: '10px', top: '10px', width: '20px', height: '20px'}}/>
                                <Row tabIndex={0} className="border-bottom pt-3 pb-1">
                                    <Col>Название</Col>
                                    <Col>Цена</Col>
                                    <Col>НДС</Col>
                                    <Col></Col>
                                </Row>
                                {tempDataItems}
                            </Container>);
                        setSuggestData(tempSuggestData);
                        setSuggestDisplay(id);
                    }
                    else
                    {
                        setSuggestData([]);
                        setSuggestDisplay(0);
                    }
                },
                error => {
                    setError(error, setFormErrors);
                    setIsLoaded(false)
                }
            );
        }
    }

    const rows = data.map((item, i) => {
        let labelDisplay = "";

        if(i>0) {
            labelDisplay = "d-lg-none";
        }

        const onEnter = event => {
            if(event.code === "Enter" || event.code === "NumpadEnter") event.preventDefault();
        }

        return (
            <Fragment key={item.id}>
                <Row>
                    <Col xs={12} sm={6} md={3} xl={4}>
                        <Form.Group className="mb-3" controlId="productStrName1" style={{position: 'relative'}}>
                            <Form.Label className={labelDisplay}>Название</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(event) => {changeProducts(item.id, 'name', event, setProducts)}}
                                onKeyUp={event => suggestion(event, item.id)}
                                value={item.name}
                                style={item.name.length>0?{}:{borderColor:'red'}}
                                autoComplete="off"
                                onKeyDown={onEnter}/>
                            {suggestDisplay===item.id? suggestData:null}
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={3} lg={2} xl={1}>
                        <Form.Group className="mb-3" controlId="productStrCount1">
                            <Form.Label className={labelDisplay}>Кол-во</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0,00"
                                step="1"
                                onChange={(event) => {changeProducts(item.id, 'count', event, setProducts)}}
                                value={item.count}
                                style={item.count.length>0?{}:{borderColor:'red'}}
                                ref={el => inputRef.current[item.id] = el}
                                onKeyDown={onEnter}/>
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={2} lg={1}>
                        <Form.Group className="mb-3" controlId="productStrMeasure1">
                            <Form.Label className={labelDisplay}>Е/изм.</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(event) => {changeProducts(item.id, 'measure', event, setProducts)}}
                                value={item.measure}
                                onKeyDown={onEnter}/>
                        </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={3} lg={2}>
                        <Form.Group className="mb-3" controlId="productStrPrice1">
                            <Form.Label className={labelDisplay}>Цена</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0,00"
                                step="0.01"
                                onChange={(event) => {changeProducts(item.id, 'price', event, setProducts)}}
                                value={item.price}
                                onKeyDown={onEnter}/>
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
                    <Col xs={6} sm={6} md={3} lg={2} >
                        <Form.Group className="mb-3" controlId="productStrSum1" >
                            <Form.Label className={labelDisplay}>Сумма</Form.Label>
                            <div style={{display: 'flex'}}>
                                <Form.Control type="text" plaintext value={item.sum} readOnly />
                                <button
                                    className="mt-1"
                                    onClick={() => { setSuggestDisplay(0); deleteItem(item.id, setProducts)}}
                                    data-tooltip-id="button-tooltip"
                                    data-tooltip-content="Удалить"
                                    data-tooltip-place="right">
                                    <TrashFill color="#0b5ed7"/>
                                </button>
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <hr className="d-lg-none"/>

            </Fragment>
        )
    })

    return (
        <Fragment>
            {formErrors.length
                ? <Alert type="danger" messages={formErrors} />
                : null
            }
            {isLoaded
                ? <Spinner/>
                : null
            }

            {rows}

            <Row>
                <Col>
                    <Button variant="primary" className="m-2" onClick={() => { setSuggestDisplay(0); addItem(setProducts)}}>
                        Добавить товар или услугу
                    </Button>
                    <Button variant="primary" className="m-2" onClick={() => selectItem()}>
                        Подбор из списка
                    </Button>
                </Col>
            </Row>
            <Tooltip id="button-tooltip" />

            <div style={{display: display, position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2, cursor: 'pointer'}}>
                <Container className="border rounded p-5" style={{display: display, position:'relative', background: '#fff', opacity:'unset'}}>
                    <XCircle color="#0b5ed7" onClick={() => setDisplay('none')} style={{cursor: 'pointer', position: 'absolute', right: '30px', top: '30px', width: '20px', height: '20px'}}/>
                    <header className="jumbotron">
                        <h1>Список товаров/услуг</h1>
                    </header>

                    <div>
                        <Row className="border-bottom pb-2 mt-3">
                            <Col></Col>
                            <Col>Название</Col>
                            <Col>Цена</Col>
                            <Col>НДС %</Col>
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
        </Fragment>
    )
}
