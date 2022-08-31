import React from "react";
import {Space, Typography} from "antd";
// import Konva from 'konva';
// import {Layer, Rect, Stage, Text as TextKonva} from "react-konva";
import { Stock } from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {dateCompensationTimeZone, dateToISOString} from "../../utils/date";
import {CandleDto} from "../../utils/interfaces/candle.dto";


const { Text } = Typography;

@Observer
class Candle extends React.Component<any, any> {

    quantum: number = 1000;   // quantum candle 1000 ms


    data: CandleDto[] = [];
    loading?: boolean;
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    // quantumData: number = 100;
    depthOBData: number = 0.0015;

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
                || this.depthOBData !== store.depthOB)) {
            this.marketData = store.market;
            this.dateStartData = store.dateStart!;
            this.dateStopData = store.dateStop!;
            this.depthOBData = store.depthOB!;

            console.log('Candle data reload');
        }
    }

    calcData() {
        this.data = [];

        const ts_code: string = '000001.SH';
        let timestamp: number = Math.floor(store.ordersBook.dateTimestamp! / this.quantum);
        this.data.push({
            ts_code,
            trade_date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
            close: store.ticker[0].price,
            open: store.ticker[0].price,
            high: store.ticker[0].price,
            low: store.ticker[0].price,
            vol: 1000, amount: 23233232
        });
        for (let i=0; i<store.ticker.length; i++) {
            const ts = Math.floor(store.ticker[i].timestamp/10);
            const currentPrice: number = store.ticker[i].price;
            if (timestamp < ts) {
                while (!!(ts - timestamp)) {
                    ++timestamp;
                    this.data.push({
                        ts_code,
                        trade_date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
                        close: currentPrice,
                        open: currentPrice,
                        high: currentPrice,
                        low: currentPrice,
                        vol: 1000, amount: 2032
                    });
                }
                continue;
            }
            if (currentPrice < this.data[this.data.length-1].low) {
                this.data[this.data.length-1].low = currentPrice;
            }
            if (currentPrice > this.data[this.data.length-1].high) {
                this.data[this.data.length-1].high = currentPrice;
            }
            this.data[this.data.length-1].close = currentPrice;
        }

        console.log('END calculate', this.data);
    }

    render() {
        // Asks - sell
        // Bids - buy

        const config = {
            width: store.width,
            height: 450,
            data: this.data,
            xField: 'trade_date',
            yField: ['open', 'close', 'high', 'low'],
            fallingFill: '#ef5350',
            risingFill: '#26a69a',
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

        this.calcData();

        return (
            <div className="app-container">
                {/*@ts-ignore*/}
                <Stock {...config} />
            </div>
        );
    }
}

export default Candle;
