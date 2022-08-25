import React from "react";
import {Typography} from "antd";
// import {Layer, Rect, Stage} from "react-konva";
import { Heatmap } from '@ant-design/plots';
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";


const { Text } = Typography;

@Observer
class HeatMap extends React.Component<any, any> {

    loading?: boolean;
    data: object[] = [];

    constructor(props: any) {
        super(props);
        define(this, {
            loading: false,
        });
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (store.dateStart && store.dateStop) {

        }
    }

    render() {

        const config = {
            width: window.innerWidth-32,
            height: 500,
            autoFit: false,
            data: this.data,
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

        // if (!store.dateStart && !store.dateStop)
        //     return (<div className="app-container">
        //         <Text>HeatMap No DATA... (select start and stop date time)</Text>
        //     </div>);
        if (this.loading || store.globalLoading)
            return (<div className="app-container">
                <Text>Loading...</Text>
            </div>);
        return (
            <div className="app-container">
                <Heatmap {...config} />
                {/*<Stage width={4700} height={700}>*/}
                {/*    <Layer>*/}
                {/*        <Rect*/}
                {/*            x={20}*/}
                {/*            y={20}*/}
                {/*            width={5}*/}
                {/*            height={3}*/}
                {/*            fill={'blue'}*/}
                {/*            opacity={0.6}*/}
                {/*        />*/}
                {/*        <Rect*/}
                {/*            x={20}*/}
                {/*            y={24}*/}
                {/*            width={5}*/}
                {/*            height={3}*/}
                {/*            fill={'red'}*/}
                {/*            opacity={0.6}*/}
                {/*        />*/}
                {/*    </Layer>*/}
                {/*</Stage>*/}
            </div>
        );
    }
}

export default HeatMap;
