import { define, KEY_VALUE_CELLS } from 'cellx';
import {Level2} from "../api/interfaces/level2.dto";
import {Ticker} from "../api/interfaces/ticker.dto";
import {Trade} from "../api/interfaces/trade.dto";


class Global {

    globalLoading: boolean = false;
    server?: string;
    market?: string;
    dateStart?: string | null;
    dateStop?: string | null;
    ordersBook: {
        sequence?: number;
        bids?: {[key: string]: number};
        asks?: {[key: string]: number};
        date?: Date;
        dateTimestamp?: number;
    } = {};
    level2: Level2[] = [];
    ticker: Ticker[] = [];
    trade: Trade[] = [];

    constructor() {
        define(this, {
            globalLoading: false,
            server: '192.168.8.19:8123',
            market: 'ETH-USDT',
            dateStart: null,
            dateStop: null,
        });

        // @ts-ignore
        this[KEY_VALUE_CELLS].get('market').onChange((e: any)=>console.log('change:market', e));
        // @ts-ignore
        this[KEY_VALUE_CELLS].get('dateStart').onChange((e: any)=>console.log('change:dateStart', e));
        // @ts-ignore
        this[KEY_VALUE_CELLS].get('dateStop').onChange((e: any)=>console.log('change:dateStop', e));
    }
}

export default new Global();