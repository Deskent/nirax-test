import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/standart/`;

class StandartService {

    getList() {        
        return axios.get(API_URL + 'list', { headers: authHeader() });
    }

    getFile(type) {
        return axios.get(API_URL + 'file?type='+type, { headers: authHeader(), responseType: 'blob' });
    }
}

export default new StandartService();
