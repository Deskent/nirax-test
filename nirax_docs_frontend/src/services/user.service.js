import axios from 'axios';
import authHeader from './auth-header';
import config from './config';

const API_URL = `${config.BASE_URL}/api/`;

class UserService {
    getAdminBoard() {
        return axios.get(API_URL + 'admin', { headers: authHeader() });
    }

    update(id, username, password, phone) {
        return axios.post(
            API_URL + "user/update", 
            {
                id,
                username,
                password, 
                phone
            }, 
            { headers: authHeader() })
            .then(response => {             
                const user = JSON.parse(localStorage.getItem('user'));

                user.username = username;
                user.phone = phone;

                localStorage.setItem("user", JSON.stringify(user));

                return response;
            });
    }
    
    setClientId(id, y_client_id) {
        return axios.post(
            API_URL + "user/yclientid", 
            {
                id,
                y_client_id
            }, 
            { headers: authHeader() })
            .then(response => {             
                return response;
            });
    }
}

export default new UserService();
