import {marketsPriceLength} from "./markets";


export function priceNormalize(market: string, priceIn: string): string {
    const price: string[] = priceIn.split('.');
    price[0] = ('000000' + price[0]).slice((-1)*marketsPriceLength[market].before);
    price[1] = ((!!price[1] ? price[1] : '') + '000000').slice(0, marketsPriceLength[market].after);
    return price.join('.');
}