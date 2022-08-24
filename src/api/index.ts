import {request} from "../utils/request";
import {ResponseDto} from "./interfaces/response.dto";


export async function level2(market: string, dateStart: string, dateStop: string) {
    return await request<ResponseDto>('', {
        method: 'post',
        data: 'SELECT * FROM default.level2 LIMIT 100\n' +
            'FORMAT JSONCompact'
    });
}

export async function ordersbook(market: string, dateStart: string, dateStop: string) {
    return await request<ResponseDto>('', {
        method: 'post',
        data: 'SELECT * FROM default.ordersbook LIMIT 100\n' +
            'FORMAT JSONCompact'
    });
}

export async function ticker(market: string, dateStart: string, dateStop: string) {
    return await request<ResponseDto>('', {
        method: 'post',
        data: 'SELECT * FROM default.ticker LIMIT 100\n' +
            'FORMAT JSONCompact'
    });
}

export async function trade(market: string, dateStart: string, dateStop: string) {
    return await request<ResponseDto>('', {
        method: 'post',
        data: 'SELECT * FROM default.trade LIMIT 100\n' +
            'FORMAT JSONCompact'
    });
}
