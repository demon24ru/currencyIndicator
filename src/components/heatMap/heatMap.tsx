import React from "react";
import _ from "lodash";
import {Space, Typography} from "antd";
import { Heatmap } from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {Level2} from "../../api/interfaces/level2.dto";
import {priceNormalize} from "../../utils/price";
import {dateCompensationTimeZone, dateToISOString} from "../../utils/date";


const { Text } = Typography;

interface mapData {
    timestamp: string;
    price: number;
    count: number;
}

@Observer
class HeatMap extends React.Component<any, any> {

    loading?: boolean;
    width: number = 32;
    mapAsks: mapData[] = [];
    mapBids: mapData[] = [];
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    asks: {[price: string]: number} = {};
    bids: {[price: string]: number} = {};
    ticker: {[ts: number]: string} = {};

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

        const quantum: number = 100; // quantum from ms
        const depthOB: number = 15/100; // depth Order book from % of current price


        this.loading = true;

        this.asks = _.clone(store.ordersBook.asks!);
        this.bids = _.clone(store.ordersBook.bids!);

        for (let i=0; i<store.ticker.length; i++) {
            this.ticker[Math.floor(store.ticker[i].timestamp/quantum)] = store.ticker[i].price;
        }

        const snapshotOB = (currentPrice: string, ts: number) => {
            const asks: string[] = [];
            const bibs: string[] = [];
            const currentPriceStart: string = priceNormalize(store.market!, (Number(currentPrice) - (Number(currentPrice)*depthOB)).toString());
            const currentPriceStop: string = priceNormalize(store.market!, (Number(currentPrice) + (Number(currentPrice)*depthOB)).toString());
            let asksSize: number = 0;
            for (let v of Object.keys(this.asks)) {
                if (v > currentPriceStart && v < currentPriceStop) {
                    asksSize += this.asks[v];
                    asks.push(v);
                }
            }
            let bidsSize: number = 0;
            for (let v of Object.keys(this.bids)) {
                if (v > currentPriceStart && v < currentPriceStop) {
                    bidsSize += this.bids[v];
                    bibs.push(v);
                }
            }
            const timestamp: string = dateToISOString(new Date(dateCompensationTimeZone(ts * quantum))) + '.' + (ts%10).toString();
            for (let v of asks)
                this.mapAsks.push({
                    timestamp,
                    count: this.asks[v]/asksSize,
                    price: (Number(v) - Number(currentPrice))/Number(currentPrice)
                });
            for (let v of bibs)
                this.mapBids.push({
                    timestamp,
                    count: this.bids[v]/bidsSize,
                    price: (Number(v) - Number(currentPrice))/Number(currentPrice)
                });
        }

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

        let timestamp: number = store.ordersBook.dateTimestamp!;
        let currentPrice: string = this.ticker[Math.floor(timestamp/quantum)];
        for (let i=0; i<store.level2.length; i++) {
            const dat: Level2 = store.level2[i];
            const tsQuantum: number = Math.floor(dat.timestamp/quantum);
            let ts: number = Math.floor(timestamp/quantum);
            console.log(ts, tsQuantum, currentPrice)
            if (ts < tsQuantum)
                while (!!(tsQuantum - ts)) {
                    snapshotOB(currentPrice, ts);
                    timestamp += quantum;
                    ++ts;
                    this.width += 5;
                }
            calcOrderBook(dat);
        }

        this.loading = false;
    }

    render() {
        // Asks - sell
        // Bids - buy
        console.log(this.width, this.mapAsks);
        const configAsks = {
            width: this.width,
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
            width: this.width,
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
