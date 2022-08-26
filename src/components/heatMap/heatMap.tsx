import React from "react";
import _ from "lodash";
import {Space, Typography} from "antd";
import { Heatmap } from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {Level2} from "../../api/interfaces/level2.dto";


const { Text } = Typography;

@Observer
class HeatMap extends React.Component<any, any> {

    loading?: boolean;
    mapAsks: object[] = [];
    mapBids: object[] = [];
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    asks: {[key: string]: number} = {};
    bids: {[key: string]: number} = {};

    constructor(props: any) {
        super(props);
        define(this, {
            loading: false,
        });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (!store.globalLoading && !!store.ordersBook.asks && !!store.ordersBook.bids
        && (this.marketData !== store.market || this.dateStartData !== store.dateStart || this.dateStopData !== store.dateStop)) {
            this.marketData = store.market;
            this.dateStartData = store.dateStart!;
            this.dateStopData = store.dateStop!;
            console.log('data reload')
            this.calcData();
        }
    }

    async calcData() {
        this.loading = true;

        this.asks = _.clone(store.ordersBook.asks!);
        this.bids = _.clone(store.ordersBook.bids!);

        const calcOrderBook = (dat: Level2) => {
            for (let j=0; j<dat.bids.length; j++) {
                if (dat.bids[j][1] === "0") {
                    delete this.bids[dat.bids[j][0]];
                    continue;
                }
                this.bids[dat.bids[j][0]] = Number(dat.bids[j][1]);
            }
            for (let j=0; j<dat.asks.length; j++) {
                if (dat.asks[j][1] === "0") {
                    delete this.asks[dat.asks[j][0]];
                    continue;
                }
                this.asks[dat.asks[j][0]] = Number(dat.asks[j][1]);
            }
        }

        const quantum: number = 100; // quantum from ms

        let timestamp: number = store.ordersBook.dateTimestamp!;
        for (let i=0; i<store.level2.length; i++) {
            const dat: Level2 = store.level2[i];
            const tsQuantum: number = Math.floor(dat.timestamp/quantum);
            let ts: number = Math.floor(timestamp/quantum);
            if (ts < tsQuantum)
                while (!!(tsQuantum - ts)) {

                    timestamp += quantum;
                    ++ts;
                }
            calcOrderBook(dat);
        }

        this.loading = false;
    }

    render() {

        const configAsks = {
            width: window.innerWidth-32,
            height: 500,
            autoFit: false,
            data: this.mapAsks,
            xField: 'timestamp',
            yField: 'price',
            colorField: 'count',
            color: ['red'],
            meta: {
                'timestamp': {
                    type: 'cat',
                },
            },
        };

        const configBids = {
            width: window.innerWidth-32,
            height: 500,
            autoFit: false,
            data: this.mapBids,
            xField: 'timestamp',
            yField: 'price',
            colorField: 'count',
            color: ['blue'],
            meta: {
                'timestamp': {
                    type: 'cat',
                },
            },
        };

        if (!store.dateStart || !store.dateStop)
            return (<div className="app-container">
                <Text>No DATA... (select start and stop date time)</Text>
            </div>);
        if (store.globalLoading)
            return (<div className="app-container">
                <Text>Loading...</Text>
            </div>);
        if (this.loading)
            return (<div className="app-container">
                <Text>Calculate Data...</Text>
            </div>);
        return (
            <div className="app-container">
                <Space direction="vertical">
                    <Heatmap {...configAsks} />
                    <Heatmap {...configBids} />
                </Space>
            </div>
        );
    }
}

export default HeatMap;
