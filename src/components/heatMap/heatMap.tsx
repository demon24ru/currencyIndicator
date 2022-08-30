import React from "react";
import _ from "lodash";
import {Space, Typography} from "antd";
import Konva from 'konva';
import {Layer, Rect, Stage, Text as TextKonva} from "react-konva";
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {dateCompensationTimeZone, dateToISOString} from "../../utils/date";
import {Level2} from "../../utils/interfaces/level2.dto";


const { Text } = Typography;

@Observer
class HeatMap extends React.Component<any, any> {

    countPixels: number = 3;   // number of pixels in one indicator
    yHeightMetric: number = 10;


    layerAsksRef: any;
    layerBidsRef: any;
    loading?: boolean;
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    quantumData: number = 100;
    depthOBData: number = 0.0015;
    asks: {[price: number]: number} = {};
    bids: {[price: number]: number} = {};
    ticker: {[ts: number]: number} = {};
    heightCanvas: number = 20;
    yLevels: number = 100;

    constructor(props: any) {
        super(props);
        define(this, {
            loading: false,
        });
        this.layerAsksRef = React.createRef();
        this.layerBidsRef = React.createRef();
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
            this.asks = {};
            this.bids = {};
            this.ticker = {};

            console.log('data reload');
            setTimeout(()=>this.calcData(), 2000);
        }
    }

    preCalcData() {
        this.yLevels = Math.floor((150 + store.depthOB!*100000)/this.countPixels);
        this.heightCanvas = (this.yLevels*(this.countPixels+1)) + this.yHeightMetric;

        this.quantumData = store.quantum!;
    }

    calcData() {

        this.asks = _.clone(store.ordersBook.asks!);
        this.bids = _.clone(store.ordersBook.bids!);

        for (let i=0; i<store.ticker.length; i++) {
            this.ticker[(this.quantumData > 100 ? Math.floor((store.ticker[i].timestamp * 100) / this.quantumData) : store.ticker[i].timestamp)] = store.ticker[i].price;
        }

        const snapshotOB = (currentPrice: number, ts: number) => {
            console.log(currentPrice);
            const asks: {[price: number]: number} = {};
            const bids: {[price: number]: number} = {};
            const currentPriceStart: number = currentPrice - (currentPrice*this.depthOBData);
            const currentPriceStop: number = currentPrice + (currentPrice*this.depthOBData);
            let asksSize: number = 0;
            for (let v of Object.keys(this.asks)) {
                if (Number(v) < currentPriceStop) {
                // if (Number(v) <= currentPrice) {
                    const prLevel: number = Math.abs(Math.round((((Number(v) - currentPrice)/currentPrice)*100000)/this.countPixels) - Math.floor((store.depthOB!*100000)/this.countPixels));
                    let count: number = 0;
                    if (prLevel >= this.yLevels) {
                        asks[this.yLevels - 1] = (asks[this.yLevels - 1] || 0) + this.asks[Number(v)];
                        count = asks[this.yLevels - 1];
                    } else {
                            asks[prLevel] = (asks[prLevel] || 0) + this.asks[Number(v)];
                            count = asks[prLevel];
                    }
                    if (asksSize < count)
                        asksSize = count;
                }
            }
            let bidsSize: number = 0;
            for (let v of Object.keys(this.bids)) {
                if (Number(v) > currentPriceStart) {
                // if (Number(v) >= currentPrice) {
                    const prLevel: number = Math.round((((Number(v) - currentPrice)/currentPrice)*100000)/this.countPixels) - Math.floor(150/this.countPixels);
                    let count: number = 0;
                    if (prLevel > 0) {
                        bids[0] = (bids[0] || 0) + this.bids[Number(v)];
                        count = bids[0];
                    } else {
                            bids[Math.abs(prLevel)] = (bids[Math.abs(prLevel)] || 0) + this.bids[Number(v)];
                            count = bids[Math.abs(prLevel)];
                    }
                    if (bidsSize < count)
                        bidsSize = count;
                }
            }

            const layerAsks = this.layerAsksRef.current;
            for (let v in asks) { // @ts-ignore
                layerAsks.add(new Konva.Rect({
                    x: (10 + (ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + (Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'red',
                    opacity: Math.round((asks[v]/asksSize)*100)/100
                }));
            }
            const layerBids = this.layerBidsRef.current;
            for (let v in bids) { // @ts-ignore
                layerBids.add(new Konva.Rect({
                    x: (10 + (ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + (Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'blue',
                    opacity: Math.round((bids[v]/bidsSize)*100)/100
                }));
            }
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

        let timestamp: number = Math.floor(store.ordersBook.dateTimestamp! / this.quantumData);
        let currentPrice: number = this.ticker[timestamp];
        console.log('currentPrice', currentPrice);
        for (let i=0; i<store.level2.length; i++) {
            const dat: Level2 = store.level2[i];
            const tsQuantum: number = Math.floor(dat.timestamp/this.quantumData);
            if (timestamp < tsQuantum)
                while (!!(tsQuantum - timestamp)) {
                    snapshotOB(currentPrice, timestamp - Math.floor(store.ordersBook.dateTimestamp!/this.quantumData));
                    ++timestamp;
                    if (this.ticker[timestamp])
                        currentPrice = this.ticker[timestamp];
                }
            calcOrderBook(dat);
        }
    }

    render() {
        // Asks - sell
        // Bids - buy
        this.preCalcData();

        const xAxisLabelContent = () => {
            console.log(store.width, store.quantum, store.depthOB);
            const ret: any[] = [];
            for (let i=0; i< Math.floor((store.width-10)/(this.countPixels+1)); i++) {
                if ((i/50)%1 === 0) {
                    ret.push(
                        <Rect
                            key={`${i}rect`}
                            x={(10 + (i*(this.countPixels+1)))}
                            y={0}
                            width={1}
                            height={this.heightCanvas}
                            fill={'black'}
                            opacity={0.05}
                        />
                    );
                    ret.push(
                        <TextKonva
                            key={`${i}text`}
                            text={dateToISOString(new Date(dateCompensationTimeZone((Math.floor(store.ordersBook.dateTimestamp! / this.quantumData) + i)* this.quantumData))) + (store.quantum === 100 ? '.' + ((Math.floor(store.ordersBook.dateTimestamp! / this.quantumData) + i)%10).toString() : '')}
                            x={(12 + (i*(this.countPixels+1)))}
                            y={0}
                        />
                    );
                }
            }
            return ret;
        }

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
                    <Stage width={store.width} height={this.heightCanvas}>
                        <Layer ref={this.layerAsksRef}>
                            { /* Metrics */ }
                            <Rect
                                x={0}
                                y={this.yHeightMetric-1}
                                width={store.width}
                                height={1}
                                fill={'black'}
                                opacity={0.48}
                            />
                            {/*<Rect*/}
                            {/*    x={9}*/}
                            {/*    y={0}*/}
                            {/*    width={1}*/}
                            {/*    height={this.heightCanvas}*/}
                            {/*    fill={'black'}*/}
                            {/*    opacity={0.48}*/}
                            {/*/>*/}
                            { /* Zero level */ }
                            <Rect
                                x={5}
                                y={((this.yLevels-Math.floor(150/this.countPixels))*(this.countPixels+1))-1 + this.yHeightMetric}
                                width={store.width-5}
                                height={5}
                                fill={'black'}
                                opacity={0.05}
                            />
                            { xAxisLabelContent() }
                        </Layer>
                    </Stage>
                    <Stage width={store.width} height={this.heightCanvas}>
                        <Layer ref={this.layerBidsRef}>
                            { /* Metrics */ }
                            <Rect
                                x={0}
                                y={this.yHeightMetric-1}
                                width={store.width}
                                height={1}
                                fill={'black'}
                                opacity={0.48}
                            />
                            {/*<Rect*/}
                            {/*    x={9}*/}
                            {/*    y={0}*/}
                            {/*    width={1}*/}
                            {/*    height={this.heightCanvas}*/}
                            {/*    fill={'black'}*/}
                            {/*    opacity={0.48}*/}
                            {/*/>*/}
                            { /* Zero level */ }
                            <Rect
                                x={5}
                                y={((this.yLevels-Math.floor((store.depthOB!*100000)/this.countPixels))*(this.countPixels+1))-1 + this.yHeightMetric}
                                width={store.width-5}
                                height={5}
                                fill={'black'}
                                opacity={0.05}
                            />
                            { xAxisLabelContent() }
                        </Layer>
                    </Stage>
                </Space>
            </div>
        );
    }
}

export default HeatMap;
