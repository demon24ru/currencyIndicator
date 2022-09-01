import React, {FC} from 'react';
import {Space} from 'antd';
import './App.less';
import HeatMap from "./components/heatMap/heatMap";
import Header from "./components/header/header";
import Candle from "./components/candle/candle";


const App: FC = () => (
    <Space direction="vertical">
        <Header />
        <Candle />
        <HeatMap />
    </Space>
);

export default App;
