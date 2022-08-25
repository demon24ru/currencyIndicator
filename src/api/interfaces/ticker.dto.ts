export interface TickerDto {
    price: string;
    sequence: string;
    size: string;
    time: number;
    bestAsk: string;
    bestAskSize: string;
    bestBid: string;
    bestBidSize: string;
}

export interface Ticker {
    price: string;
    timestamp: number;
}
