import config from './config';
import axios from 'axios';
import { saveAs } from 'file-saver';
import EventBus from '../common/EventBus.jsx';

function debug(text){
    if(config._isDebug) console.log(text);
}

export {debug};

function returnInnData(query){
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

    return axios(options)
        .then(result => {
            const obj = result.data;
            if(obj.suggestions.length>0)
            {
                return obj.suggestions[0].data;
            }
        })
        .catch(error => {
            debug("error", error);
            return false;
        });

}

export {returnInnData};

const onKeyUp = event => {
    event.target.value = event.target.value.replace (/\D/, '');
}

export {onKeyUp}

function getUserId(){
    const user = JSON.parse(localStorage.getItem('user'));
    return user.id;
}

export {getUserId}

const getDevice = () => {
    let device;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        device = "mobile";
    } else {
        device = "desktop";
    }
    return device;
}

const createAndDownloadPdf = (validate, setIsLoaded, data2, doc) => {
    if(validate())
    {
        setIsLoaded(true);
        data2.type = "pdf";
        data2.doc = doc;
        data2.device = getDevice();
        data2.not_log = "1";
        data2.version = "lk";

        axios.post(`${config.BASE_URL}/create-file`, data2)
            .then(() => axios.get(`${config.BASE_URL}/fetch-file?file_name=${data2.file_name}.pdf`, { responseType: 'blob' }))
            .then((res) => {
                const pdfBlob = new Blob([res.data], { type: 'application/pdf' });

                saveAs(pdfBlob, `${doc}${data2.num}by${data2.date}.pdf`);
                setIsLoaded(false);
            })
            .catch(function (error) {
                if (error.response) {
                    debug(error.response.data);
                    debug(error.response.status);
                    debug(error.response.headers);
                } else if (error.request) {
                    debug(error.request);
                } else {
                    debug('Error', error.message);
                }
                debug(error.config);
                setIsLoaded(false);
            });
    }
}

export { createAndDownloadPdf }

const createAndDownloadDocx = (validate, setIsLoaded, data2, doc) => {
    if(validate())
    {
        setIsLoaded(true);

        data2.type = "docx";
        data2.doc = doc;
        data2.device = getDevice();
        data2.not_log = "1";
        data2.version = "lk";

        axios.post(`${config.BASE_URL}/create-file`, data2)
            .then(() => axios.get(`${config.BASE_URL}/fetch-file?file_name=${data2.file_name}.docx`, { responseType: 'blob' }))
            .then((res) => {
                const pdfBlob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

                saveAs(pdfBlob, `${doc}${data2.num}by${data2.date}.docx`);
                setIsLoaded(false);
            })
            .catch(function (error) {
                if (error.response) {
                    debug(error.response.data);
                    debug(error.response.status);
                    debug(error.response.headers);
                } else if (error.request) {
                    debug(error.request);
                } else {
                    debug('Error', error.message);
                }
                debug(error.config);
                setIsLoaded(false);
            });
    }
}

export {createAndDownloadDocx}

function calcSum(price, count, nds)
{
    return Math.floor(100*(Number(price)*Number(count) + (Number(price)*Number(count)*Number(nds))/100))/100
}

const changeProducts = (id, prop, event, setProducts) => {
    setProducts(prev => {
        const new_products = prev.map(item => {
            if(item.id === id){
                if(prop==="price") {
                    return {
                        ...item,
                        [prop]:event.target.value,
                        sum: calcSum(event.target.value, item.count, item.nds)
                    }
                }
                else if(prop==="count") {
                    return {
                        ...item,
                        [prop]:event.target.value,
                        sum: calcSum(item.price, event.target.value, item.nds)
                    }
                }
                else if(prop==="nds") {
                    return {
                        ...item,
                        [prop]:event.target.value,
                        sum: calcSum(item.price, item.count, event.target.value)
                    }
                }
                return {
                    ...item,
                    [prop]:event.target.value,
                    sum: calcSum(item.price, item.count, item.nds)
                }
            }
            return item;
        })
        return new_products;
    })
}

export {changeProducts}

const addItem = (setProducts, newI) => {
    setProducts(prev => {
        let newItem;
        if(newI)
        {
            newItem = {
                id:newI.id?newI.id:prev.length+1,
                name: newI.name,
                count: newI.count,
                measure: newI.measure,
                price: newI.price,
                nds: newI.nds,
                sum: Math.floor(Number(newI.sum) * 100) / 100
            }
        }
        else
        {
            newItem = {
                id:prev.length+1,
                name:"",
                count:0,
                measure:"",
                price: 0,
                nds: 0,
                sum: 0
            }
        }

        const new_products = [...prev, newItem]
        return new_products;
    })
}

export {addItem}

const deleteItem = (id, setProducts) => {
    setProducts(prev => {
        return prev.filter(item => item.id !== id)
    })
}

export {deleteItem}

const changeInput = (event, setData) => {
    setData(prev => {
        return {
            ...prev,
            [event.target.id]: event.target.value,
        }
    })
}

export {changeInput}

const setError = (error, setFormErrors) => {
    setFormErrors([(error.response &&
        error.response.data &&
        error.response.data.message) ||
        error.message ||
        error.toString()])

    if (error.response && error.response.status === 401) {
        EventBus.dispatch("logout");
    }
}

export {setError}
