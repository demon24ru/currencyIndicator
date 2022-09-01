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
import {priceLevel} from "../../utils/price";
import {marketsPriceLength} from "../../utils/markets";


const { Text } = Typography;

@Observer
class Candle extends React.Component<any, any> {

    quantum: number = 1000;   // quantum candle 1000 ms


    heightCanvas: number = 450;
    data: CandleDto[] = [];
    loading?: boolean;
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    depthOBData: number = 0.0015;

    constructor(props: any) {
        super(props);
        // define(this, {
        //     loading: false,
        // });
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

        let maxPrice: number = 0;
        let minPrice: number = 99999999999;
        let timestamp: number = Math.floor(store.ordersBook.dateTimestamp! / this.quantum);
        let currentPrice: number = store.ticker[0].price;
        this.data.push({
            trade_date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
            close: currentPrice,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
        });
        for (let i=0; i<store.ticker.length; i++) {
            const ts = Math.floor(store.ticker[i].timestamp/10);
            if (timestamp < ts) {
                while (!!(ts - timestamp)) {
                    ++timestamp;
                    this.data.push({
                        trade_date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
                        close: currentPrice,
                        open: currentPrice,
                        high: currentPrice,
                        low: currentPrice,
                    });
                }
            }
            currentPrice = store.ticker[i].price;
            if (currentPrice < this.data[this.data.length-1].low) {
                this.data[this.data.length-1].low = currentPrice;
            }
            if (currentPrice > this.data[this.data.length-1].high) {
                this.data[this.data.length-1].high = currentPrice;
            }
            this.data[this.data.length-1].close = currentPrice;

            if (minPrice > currentPrice)
                minPrice = currentPrice;
            if (maxPrice < currentPrice)
                maxPrice = currentPrice;
        }

        this.heightCanvas = Math.round((Math.round(maxPrice - minPrice)/priceLevel(store.market!))*1.2);

        console.log('END calculate');
    }

    render() {

        if (!store.dateStart || !store.dateStop)
            return (<div className="app-container">
                <Text>No DATA... (select start and stop date time)</Text>
            </div>);
        if (store.globalLoading)
            return (<div className="app-container">
                <Text>Loading...</Text>
            </div>);

        this.calcData();

        const config = {
            width: store.width,
            height: this.heightCanvas,
            data: this.data,
            xField: 'trade_date',
            yField: ['open', 'close', 'high', 'low'],
            fallingFill: '#ef5350',
            risingFill: '#26a69a',
            tooltip: {
                crosshairs: {// @ts-ignore
                    text: (type, defaultContent, items) => {
                        let textContent;
                        if (type === 'x') {
                            textContent = dateToISOString(new Date(defaultContent));
                        } else {
                            textContent = `${defaultContent.toFixed(marketsPriceLength[store.market!].after)}`;
                        }
                        return {
                            position: type === 'y' ? 'start' : 'end',
                            content: textContent,
                            style: {
                                fill: '#dfdfdf',
                            },
                        };
                    },
                },
            },
        };

        console.log(this.heightCanvas, this.data);
        return (
            <div className="app-container">
                {/*@ts-ignore*/}
                <Stock {...config} />
            </div>
        );
    }
}

export default Candle;
