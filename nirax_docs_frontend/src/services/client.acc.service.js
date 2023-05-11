import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/clientacc/`;

class ClientAccService {

    getList(clientId) {
        return axios.get(API_URL + 'list?client_id=' + clientId, { headers: authHeader() });
    }

    get(id) {
        return axios.get(API_URL + 'one?id=' + id, { headers: authHeader() });
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

    update(data, id) {
        return axios.post(
            API_URL + "update", 
            {
                data, 
                id
            }, 
            { headers: authHeader() });
    }
    delete(id) {
        return axios.post(
            API_URL + "delete", 
            {
                id
            }, 
            { headers: authHeader() });
    }
}

export default new ClientAccService();
