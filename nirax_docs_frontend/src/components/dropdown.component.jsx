import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'

import Alert from './alert.component.jsx';
import Spinner from './spinner.component.jsx';

import StandartService from "../services/standart.service";
import ShablonService from "../services/shablon.service";

import { Dropdown, DropdownButton } from 'react-bootstrap';

import { setError } from "../services/functions";
import config from '../services/config';

import 'react-dadata/dist/react-dadata.css';
import 'react-tooltip/dist/react-tooltip.css'

export default function DropdownPrint ({doc_id, type}) {
    const [formErrors, setFormErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [selfItems, setSelfItems] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {

        const onPrint = (type, file_type) => {
            navigate(`${config._install_path}docprint/?type=${type}&doc_id=${doc_id}&ext=${file_type}`);
        }

        setFormErrors(false);
        const getList = () =>
        {
            setIsLoaded(true);
            StandartService.getList().then(
                response => {
                    setIsLoaded(false);

                    if(response.data.data&&response.data.data.length>0){
                        const standartDataItems = response.data.data.map((item, i) => {
                            const key = `${item.type}${type}`;
                            return (
                                <Dropdown.Item as="button" onClick={() => onPrint(item.type, type)} key={key}>{item.name}</Dropdown.Item>
                            )
                        });
                        setDataItems(standartDataItems);
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
            ShablonService.getList().then(
                response => {
                    setIsLoaded(false);

                    if(response.data.data&&response.data.data.length>0){
                        const tempDataItems = response.data.data.map((item, i) => {
                            const key = `${item.id}${type}`;
                            return (
                                <Dropdown.Item as="button" onClick={() => onPrint(item.id, type)} key={key}>
                                    {item.name}
                                </Dropdown.Item>
                            )
                        });
                        setSelfItems(tempDataItems);
                    }
                    else
                    {
                        setSelfItems([]);
                    }
                },
                error => {
                    setError(error, setFormErrors);
                    setIsLoaded(false)
                }
            );
        }
        getList();

    }, [doc_id, type])

    return (
        <>
            {formErrors.length
                ? <Alert type="danger" messages={formErrors} />
                : null
            }
            {isLoaded
                ? <Spinner/>
                : null
            }
            <Dropdown className='mx-1'
                data-tooltip-id="dd-tooltip"
                data-tooltip-content={`Сформировать документ в ${type}`}
                data-tooltip-place="right">
                <DropdownButton id="dropdown-basic-button" title={type==="docx"? "DOCX": "PDF"}>
                    {dataItems}
                    {selfItems}
                </DropdownButton>
                <Tooltip id="dd-tooltip" />
            </Dropdown>
        </>
    );
}
