import React from "react";
import {Space, Select, DatePicker} from "antd";
import store from "../../store/global";


const { Option } = Select;
const { RangePicker } = DatePicker;

const markets: string[] = [
    'BTC-USDT',
    'BTC3L-USDT',
    'BTC3S-USDT',
    'ETH-USDT',
    'ETH3L-USDT',
    'ETH3S-USDT',
    'ADA-USDT',
    'ADA3L-USDT',
    'ADA3S-USDT',
    'EOS-USDT',
    'EOS3L-USDT',
    'EOS3S-USDT',
    'BCH-USDT',
    'BCH3L-USDT',
    'BCH3S-USDT',
    'VET-USDT',
    'VET3L-USDT',
    'VET3S-USDT',
    'LTC-USDT',
    'LTC3L-USDT',
    'LTC3S-USDT',
    'XRP-USDT',
    'XRP3L-USDT',
    'XRP3S-USDT',
    'LUNA-USDT',
    'LUNA3L-USDT',
    'LUNA3S-USDT',
    'DOGE-USDT',
    'DOGE3L-USDT',
    'DOGE3S-USDT',
    'SOL-USDT',
    'SOL3L-USDT',
    'SOL3S-USDT',
    'LINK-USDT',
    'LINK3L-USDT',
    'LINK3S-USDT',
    'DOT-USDT',
    'DOT3L-USDT',
    'DOT3S-USDT',
    'ATOM-USDT',
    'ATOM3L-USDT',
    'ATOM3S-USDT',
    'UNI-USDT',
    'UNI3L-USDT',
    'UNI3S-USDT',
    'AXS-USDT',
    'AXS3L-USDT',
    'AXS3S-USDT',
    'FTM-USDT',
    'FTM3L-USDT',
    'FTM3S-USDT',
    'BNB-USDT',
    'BNB3L-USDT',
    'BNB3S-USDT',
    'MATIC-USDT',
    'MATIC3L-USDT',
    'MATIC3S-USDT',
    'SUSHI-USDT',
    'SUSHI3L-USDT',
    'SUSHI3S-USDT',
    'NEAR-USDT',
    'NEAR3L-USDT',
    'NEAR3S-USDT',
    'AAVE-USDT',
    'AAVE3L-USDT',
    'AAVE3S-USDT',
    'SAND-USDT',
    'SAND3L-USDT',
    'SAND3S-USDT',
    'AVAX-USDT',
    'AVAX3L-USDT',
    'AVAX3S-USDT',
    'MANA-USDT',
    'MANA3L-USDT',
    'MANA3S-USDT',
    'GALAX-USDT',
    'GALAX3L-USDT',
    'GALAX3S-USDT',
    'KCS-USDT'
];

class Header extends React.Component<any, any>{

    handleSelectMarcket(v: string) {
        store.market = v;
    }

    handleChangeDateRange(date: string[]) {
        store.dateStart = date[0];
        store.dateStop = date[1];
    }

    render() {
        return (
            <Space className="app-header">
                <Select defaultValue="ETH-USDT" onChange={(v)=>this.handleSelectMarcket(v)} style={{minWidth: 120}}>
                    { markets.map(m => (<Option key={m} value={m}>{m}</Option>)) }
                </Select>
                <RangePicker showTime onChange={(...arg)=>this.handleChangeDateRange(arg[1])} />
            </Space>
        );
    }
}

export default Header;
