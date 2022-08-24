import { define, KEY_VALUE_CELLS } from 'cellx';


class Global {

    market?: string;
    dateStart?: string;
    dateStop?: string;

    constructor() {
        define(this, {
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
