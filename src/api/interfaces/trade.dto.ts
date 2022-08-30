import {SideEnum} from "../../utils/enums/side.enum";

export interface TradeDto {
    sequence: string;
    type: string;
    symbol: string;
    side: SideEnum;
    price: string;
    size: string;
    tradeId: string;
    takerOrderId: string;
    makerOrderId: string;
    time: string;
}
