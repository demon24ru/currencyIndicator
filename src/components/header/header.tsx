import React from "react";
import {Space, Select, DatePicker, notification, Typography, InputNumber } from "antd";
import store from "../../store/global";
import {markets} from "../../utils/markets";
import {level2, ordersbook, ticker, trade} from "../../api/clickHouse";
import {Observer} from "cellx-react";


const { Option } = Select;
const { RangePicker } = DatePicker;

@Observer
class Header extends React.Component<any, any>{

    handleChangeServer(v: string) {
        store.server = v;
        this.loadData();
    }

    handleSelectMarket(v: string) {
        store.market = v;
        this.loadData();
    }

    handleChangeDepthOB(v: number) {
        store.depthOB = v;
    }

    // handleSelectQuantum(v: number) {
    //     store.quantum = v;
    // }

    handleChangeDateRange(date: any[]) {
        if (date === null) {
            store.dateStart = null;
            store.dateStop = null;
            return;
        }
        store.dateStart = date[0].format('YYYY-MM-DD HH:mm:ss');
        store.dateStop = date[1].format('YYYY-MM-DD HH:mm:ss');
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
                description: e.message ? e.message : 'No Data.',
                message: 'Error!',
            });
        }
        store.globalLoading = false;
    }

    render() {
        return (
            <Space className="app-header">
                <Typography.Title editable={{ onChange: (v: string) => this.handleChangeServer(v) }} level={4} style={{ margin: 0 }}>
                    {store.server}
                </Typography.Title>
                <Select disabled={store.globalLoading} loading={store.globalLoading} defaultValue="ETH-USDT" onChange={(v)=>this.handleSelectMarket(v)} style={{minWidth: 120}}>
                    { markets.map(m => (<Option key={m} value={m}>{m}</Option>)) }
                </Select>
                <RangePicker disabled={store.globalLoading} showTime onChange={(...arg)=>this.handleChangeDateRange(arg[0] as any[])} />
                <InputNumber disabled={store.globalLoading} addonBefore="OB Levels" min={5} max={1000} defaultValue={10} onChange={(v)=>this.handleChangeDepthOB(v)} />
                {/*<Select disabled={store.globalLoading} loading={store.globalLoading} defaultValue={100} onChange={(v)=>this.handleSelectQuantum(v)} style={{minWidth: 80}}>*/}
                {/*    <Option value={100}>0.1 s</Option>*/}
                {/*    <Option value={1000}>1 s</Option>*/}
                {/*</Select>*/}
            </Space>
        );
    }
}

export default Header;
