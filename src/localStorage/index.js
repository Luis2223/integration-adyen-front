class LocalStorageService {

    constructor() {
        this.service = false;
    }

    _getService() {
        if (!this.service) {
            this.service = this;
            return this.service
        }
    }

    _setToken(token, refresh_token) {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refresh_token)
    }

    _getAccessToken () {
        return localStorage.getItem('access_token')
    }

    _getRefreshToken () {
        return localStorage.getItem('refresh_token')
    }

    _clearToken () { 
        localStorage.removeItem ('access_token'); 
        localStorage.removeitem('refresh_token'); 
    }
}

export default new LocalStorageService()._getService();