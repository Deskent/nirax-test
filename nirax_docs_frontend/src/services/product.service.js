import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/product/`;

class ProductService {

    getList(doc_id) {
        return axios.get(API_URL + 'list?doc_id='+doc_id, { headers: authHeader() });
    }

    get(id) {
        return axios.get(API_URL + 'one?id='+id, { headers: authHeader() });
    }

    add(data, doc_id) {
        return axios.post(
            API_URL + "add", 
            {
                data,
                doc_id
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
    
    delete(id) {
        return axios.post(
            API_URL + "delete", 
            {
                id
            }, 
            { headers: authHeader() });
    }

    delete_all(doc_id) {
        return axios.post(
            API_URL + "delete_all", 
            {
                doc_id
            }, 
            { headers: authHeader() });
    }
}

export default new ProductService();
