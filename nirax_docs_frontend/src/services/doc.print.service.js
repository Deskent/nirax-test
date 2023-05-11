import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/docprint/`;

class DocPrintService {
    lastNum(type) {
        return axios.get(API_URL + 'last_num/?type='+type, { headers: authHeader() });
    }

    get(type, doc_id, ext) {
        return axios.get(`${API_URL}one?doc_id=${doc_id}&type=${type}&ext=${ext}`, { headers: authHeader() });
    }

    add(data) {
        return axios.post(
            API_URL + "add", 
            {
                data
            }, 
            { 
                headers: authHeader() 
            });
    }

    update(data) {
        return axios.post(
            API_URL + "update", 
            {
                data
            }, 
            { headers: authHeader() });
    }
}

export default new DocPrintService();
