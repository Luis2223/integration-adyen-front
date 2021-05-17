import Request from './request';
import Util from './util';

const DEFAULT_OPTIONS = {
    maxRetries: 3,
    retryTimeout: 1000,
    maxRequestTimeout: 3000,
    threshold: 200,
};


class RequestHttp {
    constructor(baseURL, options = DEFAULT_OPTIONS) {
        this.maxRetries = options.maxRetries;
        this.retryTimeout = options.retryTimeout;
        this.maxRequestTimeout = options.maxRequestTimeout;
        this.threshold = options.threshold;
        this.baseURL = baseURL;

        this.request = new Request({
            baseURL,
            timeout: options.maxRequestTimeout,
        });
        
    }

    async handleRequest({ url, method, body, retries = 1 }) {
        try {
            const request = await this.request.makeRequest({
                url,
                method,
                body,
            });

            return request;
        } catch (error) {
            if (retries === this.maxRetries) {
                console.error(`[${retries}] max retries reached`);
                throw error;
            }
            console.error(
                `[${retries}] an error: [${error.message}] has happened! trying again in ${this.retryTimeout}ms`
            );
            await Util.sleep(this.retryTimeout);

            return this.handleRequest({ url, retries: (retries += 1) });
        }
    }
}

export default RequestHttp;
