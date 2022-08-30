import {SideEnum} from "../enums/side.enum";


export interface Trade {
    side: SideEnum;
    price: number;
    size: number;
    timestamp: number;
}
