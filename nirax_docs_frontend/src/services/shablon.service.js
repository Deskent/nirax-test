import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/shablon/`;

class ShablonService {

    getList() {        
        return axios.get(API_URL + 'list', { headers: authHeader() });
    }

    get(id) {
        return axios.get(API_URL + 'one?id='+id, { headers: authHeader() });
    }

    getFile(id) {
        return axios.get(API_URL + 'file?id='+id, { headers: authHeader(), responseType: 'blob' });
    }

    add(data) {
        let headers = authHeader();
        headers["Content-type"] = "multipart/form-data";
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.name)
        return axios.post(
            API_URL + "add", 
            formData, 
            { 
                headers: headers 
            });
    }

    update(data) {
        let headers = authHeader();
        headers["Content-type"] = "multipart/form-data";
        const formData = new FormData();
        if(data.file) formData.append('file', data.file);
        formData.append('name', data.name)
        formData.append('id', data.id)
        return axios.post(
            API_URL + "update", 
            formData, 
            { headers: headers });
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

export default new ShablonService();
