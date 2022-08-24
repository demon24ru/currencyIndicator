import React from "react";
import {Typography} from "antd";
import {Layer, Rect, Stage} from "react-konva";
import {Observer} from "cellx-react";
import store from "../../store/global";
import {define} from "cellx";
import {level2, ordersbook} from "../../api";
import {ResponseDto} from "../../api/interfaces/response.dto";


const { Text } = Typography;

@Observer
class HeatMap extends React.Component<any, any> {

    loading?: boolean;
    level2Data: ResponseDto | null = null;
    ordersbookData: ResponseDto | null = null;

    constructor(props: any) {
        super(props);
        define(this, {
            loading: false,
        });
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (store.dateStart && store.dateStop) {
            this.level2Data = await level2(store.market!, store.dateStart, store.dateStop);
            this.ordersbookData = await ordersbook(store.market!, store.dateStart, store.dateStop);
        }
    }

    render() {
        // if (!store.dateStart && !store.dateStop)
        //     return (<div className="app-container">
        //         <Text>HeatMap No DATA... (select start and stop date time)</Text>
        //     </div>);
        // if (!this.loading)
        //     return (<div className="app-container">
        //         <Text>Loading...</Text>
        //     </div>);
        return (
            <div className="app-container">
                <Stage width={4700} height={700}>
                    <Layer>
                        <Rect
                            x={20}
                            y={20}
                            width={5}
                            height={3}
                            fill={'blue'}
                            opacity={0.6}
                        />
                        <Rect
                            x={20}
                            y={24}
                            width={5}
                            height={3}
                            fill={'red'}
                            opacity={0.6}
                        />
                    </Layer>
                </Stage>
            </div>
        );
    }
}

export default HeatMap;
