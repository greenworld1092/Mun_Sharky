import { location } from './config';
import axios from 'axios';

export const getUserPFP = async(wallet_addr) => {
//    return await fetch(`${location}/getPFP/wallet_addr=${wallet_addr}`, {method: "GET"}).then(res => res.json());
    try {
        const res = await axios.post(
        `${location}/getPFP`,
        {
            wallet_addr : wallet_addr
        }
        );
        return res.data;
    } catch (ex) {
        return ex;
    }
}