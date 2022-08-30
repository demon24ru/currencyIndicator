import React, {FC} from 'react';
import {Space, Typography} from 'antd';
import './App.less';
import HeatMap from "./components/heatMap/heatMap";
import Header from "./components/header/header";


const App: FC = () => (
    <Space direction="vertical">
        <Header />
        <HeatMap />
    </Space>
);

export default App;
