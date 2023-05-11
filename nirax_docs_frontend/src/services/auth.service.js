import axios from "axios";
import config from "./config";

const API_URL = `${config.BASE_URL}/api/auth/`;

class AuthService {
    login(email, password) {
        return axios
            .post(API_URL + "signin", {
                email,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response.data;
            });
    }

    sendPassword(email) {
        return axios
            .post(API_URL + "forgotpassword", {
                email
            })
            .then(response => {
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("user");
    }

    register(username, email, password, phone) {
        return axios.post(API_URL + "signup", {
            username,
            email,
            password, 
            phone
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
}

export default new AuthService();
