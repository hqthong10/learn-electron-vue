import axios from 'axios';
import store from './store';
import { STORE_USER_KEY } from './constants';

export default async function callRequest(method: string, url: string, data: any, option?: any) {
    let headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: ''
    };

    const userInfo = store.get(STORE_USER_KEY);
    const token = userInfo?.token;

    token && (headers['authorization'] = `Bearer ${token}`);
    option?.headers && (headers = { ...headers, ...option.headers });

    try {
        const response = await axios({
            method,
            url,
            data,
            headers
        });
        return response.data;
    } catch (err) {
        console.log(err);
        return { code: 400, status: 'error', message: 'Bad Request' };
    }
}
