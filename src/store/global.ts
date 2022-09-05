import { define, KEY_VALUE_CELLS } from 'cellx';
import {Level2} from "../utils/interfaces/level2.dto";
import {Ticker} from "../utils/interfaces/ticker.dto";
import {Trade} from "../utils/interfaces/trade.dto";


class Global {

    globalLoading: boolean = false;
    width: number = 1000;
    server?: string;
    market?: string;
    dateStart?: string | null;
    dateStop?: string | null;
    // quantum?: number = 100;
    depthOB?: number = 10;
    ordersBook: {
        sequence?: number;
        bids?: {[price: number]: number};
        asks?: {[price: number]: number};
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
            // quantum: 100,
            depthOB: 10,
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
