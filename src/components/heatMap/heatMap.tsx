import React from "react";
import _ from "lodash";
import {Space, Typography} from "antd";
import { Heatmap } from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {Level2} from "../../api/interfaces/level2.dto";
import {dateCompensationTimeZone, dateToISOString} from "../../utils/date";


const { Text } = Typography;

interface mapData {
    timestamp: string;
    price: number;
    size: number;
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
    quantumData: number = 100;
    depthOBData: number = 0.15;
    asks: {[price: number]: number} = {};
    bids: {[price: number]: number} = {};
    ticker: {[ts: number]: number} = {};

    constructor(props: any) {
        super(props);
        define(this, {
            loading: false,
        });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (!store.globalLoading && !!store.ordersBook.asks && !!store.ordersBook.bids
        && (this.marketData !== store.market
                || this.dateStartData !== store.dateStart
                || this.dateStopData !== store.dateStop
                || this.quantumData !== store.quantum
                || this.depthOBData !== store.depthOB)) {
            this.marketData = store.market;
            this.dateStartData = store.dateStart!;
            this.dateStopData = store.dateStop!;
            this.depthOBData = store.depthOB!;
            this.quantumData = store.quantum!;
            this.mapAsks = [];
            this.mapBids = [];

            console.log('data reload')
            this.calcData();
        }
    }

    async calcData() {
         this.loading = true;

        this.asks = _.clone(store.ordersBook.asks!);
        this.bids = _.clone(store.ordersBook.bids!);

        for (let i=0; i<store.ticker.length; i++) {
            this.ticker[Math.floor(store.ticker[i].timestamp/this.quantumData)] = store.ticker[i].price;
        }

        const snapshotOB = (currentPrice: number, ts: number) => {
            const asks: number[] = [];
            const bibs: number[] = [];
            const currentPriceStart: number = currentPrice - (currentPrice*this.depthOBData);
            const currentPriceStop: number = currentPrice + (currentPrice*this.depthOBData);
            let asksSize: number = 0;
            for (let v of Object.keys(this.asks)) {
                // if (Number(v) > currentPriceStart && Number(v) < currentPriceStop) {
                if (Number(v) <= currentPrice) {
                    asksSize += this.asks[Number(v)];
                    asks.push(Number(v));
                }
            }
            let bidsSize: number = 0;
            for (let v of Object.keys(this.bids)) {
                // if (Number(v) > currentPriceStart && Number(v) < currentPriceStop) {
                if (Number(v) >= currentPrice) {
                    bidsSize += this.bids[Number(v)];
                    bibs.push(Number(v));
                }
            }
            const timestamp: string = dateToISOString(new Date(dateCompensationTimeZone(ts * this.quantumData))) + (store.quantum === 100 ? '.' + (ts%10).toString() : '');
            for (let v of asks)
                this.mapAsks.push({
                    timestamp,
                    size: this.asks[v]/(asksSize),
                    price: (v - currentPrice)/currentPrice
                });
            for (let v of bibs)
                this.mapBids.push({
                    timestamp,
                    size: this.bids[v]/(bidsSize),
                    price: (v - currentPrice)/currentPrice
                });
        }

        const calcOrderBook = (dat: Level2) => {
            for (let j=0; j<dat.bids.length; j++) {
                if (dat.bids[j][1] === 0) {
                    delete this.bids[dat.bids[j][0]];
                    continue;
                }
                this.bids[dat.bids[j][0]] = dat.bids[j][1];
            }
            for (let j=0; j<dat.asks.length; j++) {
                if (dat.asks[j][1] === 0) {
                    delete this.asks[dat.asks[j][0]];
                    continue;
                }
                this.asks[dat.asks[j][0]] = dat.asks[j][1];
            }
        }

        let timestamp: number = store.ordersBook.dateTimestamp!;
        let currentPrice: number = this.ticker[Math.floor(timestamp/this.quantumData)];
        console.log('currentPrice', currentPrice);
        for (let i=0; i<store.level2.length; i++) {
            const dat: Level2 = store.level2[i];
            const tsQuantum: number = Math.floor(dat.timestamp/this.quantumData);
            let ts: number = Math.floor(timestamp/this.quantumData);
            if (ts < tsQuantum)
                while (!!(tsQuantum - ts)) {
                    snapshotOB(currentPrice, ts);
                    timestamp += this.quantumData;
                    ++ts;
                    this.width += 10;
                    if (this.ticker[Math.floor(timestamp/this.quantumData)])
                        currentPrice = this.ticker[Math.floor(timestamp/this.quantumData)];
                }
            calcOrderBook(dat);
        }

        this.loading = false;
    }

    render() {
        // Asks - sell
        // Bids - buy
        console.log(this.width, this.mapBids, store.quantum, store.depthOB);

        const configAsks = {
            width: 1500,
            height: 500,
            autoFit: false,
            data: this.mapAsks,
            xField: 'timestamp',
            yField: 'price',
            colorField: 'size',
            // @ts-ignore
            color: ({ size }) => {
                if (size > 1)
                    return '#ff0000';
                return '#ff0000' + Math.round(size*255).toString(16).toUpperCase().padStart(2, '0')
            },
            meta: {
                'price': {
                    type: 'cat',
                },
            },
        };

        const configBids = {
            width: 1500,
            height: 500,
            autoFit: false,
            data: this.mapBids,
            xField: 'timestamp',
            yField: 'price',
            colorField: 'size',
            // @ts-ignore
            color: ({ size }) => {
                if (size > 1)
                    return '#0048ff';
                return '#0048ff' + Math.round(size*255).toString(16).toUpperCase().padStart(2, '0')
            },
            meta: {
                'price': {
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
                    {/* @ts-ignore */}
                    <Heatmap {...configAsks} />
                    {/* @ts-ignore */}
                    <Heatmap {...configBids} />
                </Space>
            </div>
        );
    }
}

export default HeatMap;
