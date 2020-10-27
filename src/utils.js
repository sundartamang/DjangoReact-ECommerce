import axios from 'axios';
import { endpoint } from './constant'

export const authAxios = axios.create({
    baseURL: endpoint,
    headers: {
        Authorization: `Token ${localStorage.getItem('token')}`
    }

})