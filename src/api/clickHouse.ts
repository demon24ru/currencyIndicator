import {request} from "../utils/request";
import {ResponseDto} from "./interfaces/response.dto";
import {dateToISOString} from "../utils/date";
import store from "../store/global";
import {Level2Dto} from "./interfaces/level2.dto";
import {TickerDto} from "./interfaces/ticker.dto";
import {TradeDto} from "./interfaces/trade.dto";


export async function level2(): Promise<void> {
    if (!store.ordersBook.sequence)
        throw new Error('Order Book not load!');
    const dateStart: Date = new Date(store.ordersBook.date!);
    dateStart.setTime(store.ordersBook.date!.getTime() - (5 * 1000));  // 5 seconds minus to compensate for recording delay
    const data: ResponseDto = await request<ResponseDto>('', {
        method: 'post',
        data: `SELECT data, toDecimal64(timestamp, 9) FROM default.level2 WHERE 1=1 AND market = '${store.market}' AND timestamp >= '${dateToISOString(dateStart)}' AND timestamp <= '${store.dateStop}'\n` +
            `FORMAT JSONCompact`
    });
    try {
        for (let i=0; i<data.data.length; i++) {
            const dat: Level2Dto = JSON.parse(data.data[i][0] as string) as Level2Dto;
            if (dat.sequenceStart > store.ordersBook.sequence)
                store.level2.push({
                    asks: dat.changes.asks,
                    bids: dat.changes.bids,
                    timestamp: Math.floor((data.data[i][1] as number)*1000)
                });
        }
    } catch (e) {
        store.level2 = [];
        throw new Error('Level2 error parse');
    }
}

export async function ordersbook(): Promise<void> {
    const d: Date = new Date(store.dateStart!);
    const dateStart: Date = new Date(d);
    dateStart.setTime(d.getTime() - (10 * 60 * 1000));
    const dateStop: Date = new Date(d);
    dateStop.setTime(d.getTime() + (10 * 60 * 1000));
    const data: ResponseDto = await request<ResponseDto>('', {
        method: 'post',
        data: `SELECT sequence, bids, asks, toDecimal64(timestamp, 3) FROM default.ordersbook WHERE 1=1 AND market = '${store.market}' AND timestamp >= '${dateToISOString(dateStart)}' AND timestamp <= '${dateToISOString(dateStop)}'\n` +
            `FORMAT JSONCompact`
    });
    let id: number = 0;
    for (let i=0; i<data.data.length; i++) {
        const v = (x: number) => Math.abs(((data.data[x][3] as number) * 1000) - (d.getTime() - (d.getTimezoneOffset() * 60 * 1000)));
        if (v(id) > v(i)) id = i;
    }

    store.ordersBook.sequence = Number(data.data[id][0]);
    store.ordersBook.date = new Date(((data.data[id][3] as number)*1000) + (d.getTimezoneOffset() * 60 * 1000));
    try {
        const pars = (v: string): {[key: string]: number} => {
            const data: string[][] = JSON.parse(v) as string[][];
            const r: {[key: string]: number} = {};
            for (let d of data) {
                r[d[0]] = Number(d[1]);
            }
            return r;
        }
        store.ordersBook.bids = pars(data.data[id][1] as string);
        store.ordersBook.asks = pars(data.data[id][2] as string);
    } catch (e) {
        store.ordersBook = {};
        throw new Error('Orders Book error parse');
    }

}

export async function ticker(): Promise<void> {
    if (!store.ordersBook.sequence)
        throw new Error('Order Book not load!');
    const dateStart: Date = new Date(store.ordersBook.date!);
    dateStart.setTime(store.ordersBook.date!.getTime() - (5 * 1000));  // 5 seconds minus to compensate for recording delay
    const data: ResponseDto = await request<ResponseDto>('', {
        method: 'post',
        data: `SELECT data, toDecimal64(timestamp, 3) FROM default.ticker WHERE 1=1 AND market = '${store.market}' AND timestamp >= '${dateToISOString(dateStart)}' AND timestamp <= '${store.dateStop}'\n` +
            `FORMAT JSONCompact`
    });
    try {
        for (let i=0; i<data.data.length; i++) {
            const dat: TickerDto = JSON.parse(data.data[i][0] as string) as TickerDto;
            if (Number(dat.sequence) > store.ordersBook.sequence)
                store.ticker.push({
                    price: dat.price,
                    timestamp: (data.data[i][1] as number)*1000
                });
        }
    } catch (e) {
        store.ticker = [];
        throw new Error('Ticker error parse');
    }
}

export async function trade(): Promise<void> {
    if (!store.ordersBook.sequence)
        throw new Error('Order Book not load!');
    const dateStart: Date = new Date(store.ordersBook.date!);
    dateStart.setTime(store.ordersBook.date!.getTime() - (5 * 1000));  // 5 seconds minus to compensate for recording delay
    const data: ResponseDto = await request<ResponseDto>('', {
        method: 'post',
        data: `SELECT data, toDecimal64(timestamp, 3) FROM default.trade WHERE 1=1 AND market = '${store.market}' AND timestamp >= '${dateToISOString(dateStart)}' AND timestamp <= '${store.dateStop}'\n` +
            `FORMAT JSONCompact`
    });
    try {
        for (let i=0; i<data.data.length; i++) {
            const dat: TradeDto = JSON.parse(data.data[i][0] as string) as TradeDto;
            if (Number(dat.sequence) > store.ordersBook.sequence)
                store.trade.push({
                    side: dat.side,
                    price: dat.price,
                    size: Number(dat.size),
                    timestamp: (data.data[i][1] as number)*1000
                });
        }
    } catch (e) {
        store.trade = [];
        throw new Error('Trade error parse');
    }
}
