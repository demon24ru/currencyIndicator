import React from "react";
import {Space, Select, DatePicker, notification} from "antd";
import store from "../../store/global";
import {markets} from "./markets";
import {level2, ordersbook, ticker, trade} from "../../api/clickHouse";
import {Observer} from "cellx-react";


const { Option } = Select;
const { RangePicker } = DatePicker;

@Observer
class Header extends React.Component<any, any>{

    handleSelectMarcket(v: string) {
        store.market = v;
        this.loadData();
    }

    handleChangeDateRange(date: any[]) {
        if (date === null) {
            store.dateStart = null;
            store.dateStop = null;
            return;
        }
        store.dateStart = date[0].format('YYYY-MM-DDTHH:mm:ss');
        store.dateStop = date[1].format('YYYY-MM-DDTHH:mm:ss');
        this.loadData();
    }

    async loadData() {
        if (!store.market || !store.dateStart || !store.dateStop)
            return;

        store.globalLoading = true;
        try {
            await ordersbook();
            await level2();
            await ticker();
            await trade();
        } catch (e) {
            notification.error({
                // @ts-ignore
                description: e.message,
                message: 'Error!',
            });
        }
        console.log(store.level2[0])
        store.globalLoading = false;
    }

    render() {
        return (
            <Space className="app-header">
                <Select disabled={store.globalLoading} loading={store.globalLoading} defaultValue="ETH-USDT" onChange={(v)=>this.handleSelectMarcket(v)} style={{minWidth: 120}}>
                    { markets.map(m => (<Option key={m} value={m}>{m}</Option>)) }
                </Select>
                <RangePicker disabled={store.globalLoading} showTime onChange={(...arg)=>this.handleChangeDateRange(arg[0] as any[])} />
            </Space>
        );
    }
}

export default Header;
