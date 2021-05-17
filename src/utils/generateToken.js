import axios from "axios";
import localStorage from "../localStorage";
import RequestHttp from "./requestHttp";

class GenerateToken {
    constructor(
        client_id = process.env.REACT_SENSEDIA_GATEWAY_USER,
        password_id = process.env.REACT_SENSEDIA_GATEWAY_PASS,
        redirect_uri = 'https://localhost',
    ) {
        this.api = axios.create({
            baseURL: 'http://api-grupozelo.sensedia.com',
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
                // 'Access-Control-Allow-Origin': '*',
            },
        })
        this.client_id = client_id;
        this.password_id = password_id;
        this.redirect_uri = redirect_uri;
        this.grant_code = '';
    }
    
    async grantCode() {
        try {
            const grant_code = await this.api.post(
                '/oauth/grant-code', 
                {
                    client_id: this.client_id,
                    redirect_uri: this.redirect_uri
                },
            ).then(response => response.data)

            console.log(`response grant_code ${grant_code}`)

            const { redirect_uri } = grant_code;

            const [, code] = redirect_uri.split('=');

            console.log(`grant code oauth ${code}`)

            this.grant_code = code;

            const { access_token, refresh_token } = await this.accessToken();
            
            localStorage._setToken(access_token, refresh_token);

            return { access_token, refresh_token };
        } catch (error) {
            throw Object({
                error: 'Erro Inesperado!',
                stack: error
            })
        }
    }

    async accessToken() {
        try {
            const access_token = await this.api.post(
                `/oauth/access-token`, 
                {
                    grant_type: 'authorization_code', //authorization_code,
                    code: this.grant_code//access_code
                },
                {
                    auth: {
                        username: this.client_id,
                        password: this.password_id
                    }
                }
            ).then(response => response.data)
            return access_token
        } catch (error) {
            throw Object({
                error: 'Erro Inesperado',
                stack: error
            })
        }
    }

    async refreshToken(token) {
        try {
            const refresh_token = await this.api.post(
                `/oauth/access_token`,
                {
                    grant_type: 'refresh_token', // refresh token
                    refresh_token: token
                }, 
                {
                    auth: {
                        username: this.username,
                        password: this.password_id
                    }                    
                }
            ).then(response => {
                if (response.status === 401) {
                    return false;
                }
                return response.data;
            })

            if (!refresh_token) {
                const access_token = await this.grantCode();
                return access_token;
            }

            return refresh_token;
        } catch (error) {
            throw Object({
                error: 'Erro Inesperado',
                stack: error
            })
        }
    }

}

export default new GenerateToken()