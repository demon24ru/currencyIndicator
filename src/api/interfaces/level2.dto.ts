export interface Level2Dto {
    sequenceStart: number;
    symbol: string;
    changes: {
        asks: string[][];
        bids: string[][];
    };
    sequenceEnd: number;
}

export interface Level2 {
    asks: string[][];
    bids: string[][];
    timestamp: number;
}
