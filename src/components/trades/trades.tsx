import React from "react";
import {Space, Typography} from "antd";
// import Konva from 'konva';
// import {Layer, Rect, Stage, Text as TextKonva} from "react-konva";
import {BidirectionalBar} from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
// import {define} from "cellx";
import {dateCompensationTimeZone, dateToISOString} from "../../utils/date";
import {CountBuySellDto} from "../../utils/interfaces/countBuySell.dto";
import {SideEnum} from "../../utils/enums/side.enum";
import {marketsPriceLength} from "../../utils/markets";


const { Text } = Typography;

@Observer
class Trades extends React.Component<any, any> {

    quantum: number = 1000;   // quantum candle 1000 ms


    heightCanvas: number = 450;
    dataCount: CountBuySellDto[] = [];
    dataSize: CountBuySellDto[] = [];
    maxCount: number = 0;
    maxSize: number = 0;
    // loading?: boolean;
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
        }
    }

    calcData() {
        this.dataCount = [];
        this.dataSize = [];
        this.maxCount = 0;
        this.maxSize = 0;

        let timestamp: number = Math.floor(store.ordersBook.dateTimestamp! / this.quantum);
        this.dataCount.push({
            date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
            buys: 0,
            sells: 0
        });
        this.dataSize.push({
            date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
            buys: 0,
            sells: 0
        });
        for (let i=0; i<store.trade.length; i++) {
            const ts = Math.floor(store.trade[i].timestamp/this.quantum);
            if (timestamp < ts) {
                while (!!(ts - timestamp)) {
                    ++timestamp;
                    this.dataCount.push({
                        date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
                        buys: 0,
                        sells: 0
                    });
                    this.dataSize.push({
                        date: dateToISOString(new Date(dateCompensationTimeZone(timestamp* this.quantum))),
                        buys: 0,
                        sells: 0
                    });
                }
            }

            if (store.trade[i].side === SideEnum.BUY) {
                ++this.dataCount[this.dataCount.length - 1].buys;
                this.dataSize[this.dataSize.length-1].buys += store.trade[i].size;
            }
            else {
                ++this.dataCount[this.dataCount.length - 1].sells;
                this.dataSize[this.dataSize.length-1].sells += store.trade[i].size;
            }

            if (this.maxCount < this.dataCount[this.dataCount.length-1].buys)
                this.maxCount = this.dataCount[this.dataCount.length-1].buys;
            if (this.maxCount < this.dataCount[this.dataCount.length-1].sells)
                this.maxCount = this.dataCount[this.dataCount.length-1].sells;

            if (this.maxSize < this.dataSize[this.dataSize.length-1].buys)
                this.maxSize = this.dataSize[this.dataSize.length-1].buys;
            if (this.maxSize < this.dataSize[this.dataSize.length-1].sells)
                this.maxSize = this.dataSize[this.dataSize.length-1].sells;
        }
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


        const configCount = {
            width: store.width,
            height: this.heightCanvas,
            data: this.dataCount,
            layout: 'vertical',
            xField: 'date',
            yField: ['sells', 'buys'],
            yAxis: {
                'sells': {
                    min: 0,
                    max: this.maxCount
                },
                'buys': {
                    min: 0,
                    max: this.maxCount
                },
            },
            tooltip: {
                shared: true,
                showMarkers: false,
                formatter: (v: CountBuySellDto) => {
                    if(v.sells || v.sells === 0)
                        return { title: `${v.date}`, name: 'sells', value: v.sells };
                    if (v.buys || v.buys === 0)
                        return { title: `${v.date}`, name: 'buys', value: v.buys };
                }
            },
        };

        const configSize = {
            width: store.width,
            height: this.heightCanvas,
            data: this.dataSize,
            layout: 'vertical',
            xField: 'date',
            yField: ['sells', 'buys'],
            yAxis: {
                'sells': {
                    min: 0,
                    max: this.maxSize
                },
                'buys': {
                    min: 0,
                    max: this.maxSize
                },
            },
            tooltip: {
                shared: true,
                showMarkers: false,
                formatter: (v: CountBuySellDto) => {
                    if(v.sells || v.sells === 0)
                        return { title: `${v.date}`, name: 'sells', value: v.sells };
                    if (v.buys || v.buys === 0)
                        return { title: `${v.date}`, name: 'buys', value: v.buys };
                }
            },
        };

        console.log(this.heightCanvas, this.dataCount);
        return (
            <div className="app-container">
                <Space direction="vertical">
                    <Text>Amount</Text>
                    {/*@ts-ignore*/}
                    <BidirectionalBar {...configCount} />
                    <Text>Size</Text>
                    {/*@ts-ignore*/}
                    <BidirectionalBar {...configSize} />
                </Space>
            </div>
        );
    }
}

export default Trades;
