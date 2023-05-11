import axios from 'axios';
import config from './config';

class FileService {

    getStandart(type) {
        return axios.get(`${config.BASE_URL}/get-standart?type=${type}`, { responseType: 'blob' })
    }
}

export default new FileService();
