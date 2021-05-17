import axios from 'axios';
import localStorage from '../localStorage';
import generateToken from './generateToken';

class Request {
    constructor({ baseURL, timeout }) {
        this.request = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
                'client_id': '8583dd83-bc1d-342e-b9ed-2bc00379737e'
                // 'Access-Control-Allow-Origin': '*',
            },
        });
        
        this.request.interceptors.request.use(
            config => {
                console.log(`request interceptor is running...`)
                const token = localStorage._getAccessToken();
                if (token) {
                    config.headers['access_token'] = token
                } else {
                    return generateToken.grantCode()
                    .then(response => {
                        localStorage._setToken(response.access_token);
                        config.headers['access_token'] = response.access_token;
                        return config;
                    })
                    .catch(error => {
                        console.log('is running request interceptor error.');
                        Promise.reject(error);
                    })
                    
                }

                return config;
            },
            error => {
                console.error(`request interceptor error ${JSON.stringify(error)}`)
                Promise.reject(error)
            }
        )

        this.request.interceptors.response.use(
            response => {
                return response;
            },
            function(error) {
                console.log(`response interceptor is running... ${JSON.stringify(error)}`)

                const originalRequest = error.config;
                if (error.response.status === 401 && !originalRequest.url === 'http://api-grupozelo.sensedia.com/v1/auth/token') { 
                    console.log(`response error`)
                    return Promise.reject(error); 
                } 

                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    return generateToken.refreshToken(localStorage._getRefreshToken())
                    .then(response => {
                        localStorage._setToken(response.access_token, response.refresh_token)
                        this.request.defaults.headers.common['access_token'] = localStorage._getAccessToken();
                        return this.request(originalRequest);
                    })
                }
                return Promise.reject(error)
            }
        )
    }

    async get(url, body) {
        try {
            console.log(`running get http ${JSON.stringify(body)}`)
            const getdata = await this.request.get(url, {
                params: body
            }).then((res) => res.data);

            return getdata;
        } catch (error) {
            throw new Error('error: ', error);
        }
    }

    async post(url, body) {
        try {
            console.log(`running post http ${JSON.stringify(body)}`)
            const postdata = await this.request.post(url, body).then((res) => res.data);
            return postdata;
        } catch (error) {
            console.error(`error post method ${JSON.stringify(error)}`);
            console.error(error)
            throw Object({
                message: 'Algo deu errado!',
                stack: error
            })
        }
    }

    async makeRequest({ url, method, body = false }) {
        console.log(`running is method ${method}`)
        return Promise.race([this[method](url, body)]);
    }
}

export default Request;
