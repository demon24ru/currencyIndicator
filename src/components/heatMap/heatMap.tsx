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
import {marketsPriceLength} from "../../utils/markets";
import {priceLevel} from "../../utils/price";


const { Text } = Typography;

@Observer
class HeatMap extends React.Component<any, any> {

    countPixels: number = 3;   // number of pixels in one indicator
    yHeightMetric: number = 10;
    quantum: number = 100; // quantum ms timestamp


    layerAsksRef: any;
    layerBidsRef: any;
    loading?: boolean;
    marketData?: string;
    dateStartData?: string;
    dateStopData?: string;
    depthOBData: number = 0.0006;
    asks: {[price: number]: number} = {};
    bids: {[price: number]: number} = {};
    delAsks: {[price: number]: number} = {};
    delBids: {[price: number]: number} = {};
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
            this.delAsks = {};
            this.delBids = {};
            this.ticker = {};

            console.log('data reload');
            this.loading = true;
            setTimeout(()=>this.calcData(), 2000);
        }
    }

    preCalcData() {
        this.yLevels = 50 + store.depthOB! + 1;
        this.heightCanvas = Math.round(this.yLevels*(this.countPixels+1)) + this.yHeightMetric;
    }

    async calcData() {
        this.loading = true;

        this.asks = _.clone(store.ordersBook.asks!);
        this.bids = _.clone(store.ordersBook.bids!);

        for (let i=0; i<store.ticker.length; i++) {
            this.ticker[store.ticker[i].timestamp] = store.ticker[i].price;
        }

        const snapshotOB = (currentPrice: number, ts: number) => {
            // console.log(currentPrice);
            const asks: {[price: number]: number} = {};
            const bids: {[price: number]: number} = {};
            const delAsks: {[price: number]: number} = {};
            const delBids: {[price: number]: number} = {};
            const currentPriceStart: number = currentPrice - this.depthOBData*priceLevel(store.market!);
            const currentPriceStop: number = currentPrice + this.depthOBData*priceLevel(store.market!);
            let maxSize: number = 0;
            for (let v of Object.keys(this.asks)) {
                if (Number(v) <= currentPriceStop) {
                    const prLevel: number = Math.round((currentPriceStop - Number(v))/priceLevel(store.market!));
                    let count: number = 0;
                    if (prLevel >= this.yLevels) {
                        asks[this.yLevels - 1] = (asks[this.yLevels - 1] || 0) + this.asks[Number(v)];
                        count = asks[this.yLevels - 1];
                    } else {
                        asks[prLevel] = (asks[prLevel] || 0) + this.asks[Number(v)];
                        count = asks[prLevel];
                    }
                    if (maxSize < count)
                        maxSize = count;
                }
            }

            for (let v of Object.keys(this.bids)) {
                if (Number(v) >= currentPriceStart) {
                    const prLevel: number = this.yLevels - 1 - Math.round((Number(v) - currentPriceStart)/priceLevel(store.market!));
                    let count: number = 0;
                    if (prLevel < 0) {
                        bids[0] = (bids[0] || 0) + this.bids[Number(v)];
                        count = bids[0];
                    } else {
                        bids[prLevel] = (bids[prLevel] || 0) + this.bids[Number(v)];
                        count = bids[prLevel];
                    }
                    if (maxSize < count)
                        maxSize = count;
                }
            }

            for (let v of Object.keys(this.delAsks)) {
                if (Number(v) <= currentPriceStop) {
                    const prLevel: number = Math.round((currentPriceStop - Number(v))/priceLevel(store.market!));
                    let count: number = 0;
                    if (prLevel >= this.yLevels) {
                        delAsks[this.yLevels - 1] = (delAsks[this.yLevels - 1] || 0) + this.delAsks[Number(v)];
                        count = delAsks[this.yLevels - 1];
                    } else {
                        delAsks[prLevel] = (delAsks[prLevel] || 0) + this.delAsks[Number(v)];
                        count = delAsks[prLevel];
                    }
                    if (maxSize < count)
                        maxSize = count;
                }
            }

            for (let v of Object.keys(this.delBids)) {
                if (Number(v) >= currentPriceStart) {
                    const prLevel: number = this.yLevels - 1 - Math.round((Number(v) - currentPriceStart)/priceLevel(store.market!));
                    let count: number = 0;
                    if (prLevel < 0) {
                        delBids[0] = (delBids[0] || 0) + this.delBids[Number(v)];
                        count = delBids[0];
                    } else {
                        delBids[prLevel] = (delBids[prLevel] || 0) + this.delBids[Number(v)];
                        count = delBids[prLevel];
                    }
                    if (maxSize < count)
                        maxSize = count;
                }
            }

            const layerAsks = this.layerAsksRef.current;
            for (let v in asks) { // @ts-ignore
                layerAsks.add(new Konva.Rect({
                    x: (10 + Math.round(ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + Math.round(Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'red',
                    opacity: Math.round((asks[v]/maxSize)*100)/100
                }));
            }
            for (let v in delAsks) { // @ts-ignore
                layerAsks.add(new Konva.Rect({
                    x: (10 + Math.round(ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + Math.round(Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'blue',
                    opacity: Math.round((delAsks[v]/maxSize)*100)/100
                }));
            }
            const layerBids = this.layerBidsRef.current;
            for (let v in bids) { // @ts-ignore
                layerBids.add(new Konva.Rect({
                    x: (10 + Math.round(ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + Math.round(Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'green',
                    opacity: Math.round((bids[v]/maxSize)*100)/100
                }));
            }
            for (let v in delBids) { // @ts-ignore
                layerBids.add(new Konva.Rect({
                    x: (10 + Math.round(ts*(this.countPixels+1))),
                    y: (this.yHeightMetric + Math.round(Number(v)*(this.countPixels+1))),
                    width: this.countPixels,
                    height: this.countPixels,
                    fill: 'blue',
                    opacity: Math.round((delBids[v]/maxSize)*100)/100
                }));
            }

            this.delAsks = {};
            this.delBids = {};
        }

        const calcOrderBook = (dat: Level2) => {
            for (let j=0; j<dat.bids.length; j++) {
                if (dat.bids[j][1] === 0) {
                    this.delBids[dat.bids[j][0]] = this.bids[dat.bids[j][0]];
                    delete this.bids[dat.bids[j][0]];
                    continue;
                }
                this.bids[dat.bids[j][0]] = dat.bids[j][1];
            }
            for (let j=0; j<dat.asks.length; j++) {
                if (dat.asks[j][1] === 0) {
                    this.delAsks[dat.asks[j][0]] = this.asks[dat.asks[j][0]];
                    delete this.asks[dat.asks[j][0]];
                    continue;
                }
                this.asks[dat.asks[j][0]] = dat.asks[j][1];
            }
        }

        let timestamp: number = Math.floor(store.ordersBook.dateTimestamp! / this.quantum);
        let currentPrice: number = this.ticker[timestamp];
        console.log('currentPrice', currentPrice);
        for (let i=0; i<store.level2.length; i++) {
            const dat: Level2 = store.level2[i];
            const tsQuantum: number = Math.floor(dat.timestamp/this.quantum);
            if (timestamp < tsQuantum)
                while (!!(tsQuantum - timestamp)) {
                    snapshotOB(currentPrice, timestamp - Math.floor(store.ordersBook.dateTimestamp!/this.quantum));
                    ++timestamp;
                    if (this.ticker[timestamp]) {
                        const layerAsks = this.layerAsksRef.current;
                        const layerBids = this.layerBidsRef.current;
                        if (currentPrice > this.ticker[timestamp]) {
                            // @ts-ignore
                            layerAsks.add(new Konva.Rect({
                                x: ((10 + ((timestamp - Math.floor(store.ordersBook.dateTimestamp! / this.quantum)) * (this.countPixels + 1))) - 1),
                                y: 0,
                                width: 1,
                                height: this.heightCanvas,
                                fill: 'red',
                                opacity: 0.3
                            }));
                            // @ts-ignore
                            layerBids.add(new Konva.Rect({
                                x: ((10 + ((timestamp - Math.floor(store.ordersBook.dateTimestamp! / this.quantum)) * (this.countPixels + 1))) - 1),
                                y: 0,
                                width: 1,
                                height: this.heightCanvas,
                                fill: 'red',
                                opacity: 0.3
                            }));
                        } else if (currentPrice < this.ticker[timestamp]) {
                            // @ts-ignore
                            layerAsks.add(new Konva.Rect({
                                x: ((10 + ((timestamp - Math.floor(store.ordersBook.dateTimestamp!/this.quantum))*(this.countPixels+1)))-1),
                                y: 0,
                                width: 1,
                                height: this.heightCanvas,
                                fill: 'green',
                                opacity: 0.3
                            }));
                            // @ts-ignore
                            layerBids.add(new Konva.Rect({
                                x: ((10 + ((timestamp - Math.floor(store.ordersBook.dateTimestamp!/this.quantum))*(this.countPixels+1)))-1),
                                y: 0,
                                width: 1,
                                height: this.heightCanvas,
                                fill: 'green',
                                opacity: 0.3
                            }));
                        }
                        currentPrice = this.ticker[timestamp];
                    }
                }
            calcOrderBook(dat);
        }
        this.loading = false;
    }

    render() {
        // Asks - sell
        // Bids - buy
        this.preCalcData();

        const xAxisLabelContent = () => {
            console.log(store.width, store.depthOB);
            const ret: any[] = [];
            const offset: number = 10 - Math.floor((store.ordersBook.dateTimestamp!%1000)/this.quantum);
            for (let i=0; i< Math.floor((store.width-10)/(this.countPixels+1))-offset; i++) {
                if ((i/40)%1 === 0) {
                    ret.push(
                        <Rect
                            key={`${i}rect`}
                            x={(10 + (offset*(this.countPixels+1)) + (i*(this.countPixels+1)))}
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
                            text={dateToISOString(new Date(dateCompensationTimeZone((Math.floor(store.ordersBook.dateTimestamp! / this.quantum) + offset + i)* this.quantum)))}
                            x={(12 + (offset*(this.countPixels+1)) + (i*(this.countPixels+1)))}
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

        return (
            <div className="app-container">
                <Space direction="vertical">
                    { this.loading && <Text>Calculate Data...</Text> }
                    <Stage width={store.width} height={this.heightCanvas}>
                        <Layer ref={this.layerAsksRef}>
                            { /* Metrics */ }
                            <Rect
                                x={0}
                                y={this.yHeightMetric-1}
                                width={store.width}
                                height={1}
                                fill={'black'}
                                opacity={0.05}
                            />
                            { /* Zero level */ }
                            <Rect
                                x={5}
                                y={Math.round((this.yLevels - 50 - 1)*(this.countPixels+1)) - 1 + this.yHeightMetric}
                                width={store.width-5}
                                height={1}
                                fill={'black'}
                                opacity={0.03}
                            />
                            <Rect
                                x={5}
                                y={Math.round((this.yLevels - 50)*(this.countPixels+1)) - 1 + this.yHeightMetric}
                                width={store.width-5}
                                height={1}
                                fill={'black'}
                                opacity={0.03}
                            />
                            <TextKonva
                                text="0"
                                x={0}
                                y={Math.round((this.yLevels - 50 - 1)*(this.countPixels+1)) - 3 + this.yHeightMetric}
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
                                opacity={0.05}
                            />
                            { /* Zero level */ }
                            <Rect
                                x={5}
                                y={Math.round(50*(this.countPixels+1))-1 + this.yHeightMetric}
                                width={store.width-5}
                                height={1}
                                fill={'black'}
                                opacity={0.03}
                            />
                            <Rect
                                x={5}
                                y={Math.round((50+1)*(this.countPixels+1))-1 + this.yHeightMetric}
                                width={store.width-5}
                                height={1}
                                fill={'black'}
                                opacity={0.03}
                            />
                            <TextKonva
                                text="0"
                                x={0}
                                y={Math.round(50*(this.countPixels+1))-3 + this.yHeightMetric}
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
