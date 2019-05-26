import React from 'react';
import { Card, CardFooter, CardHeader, CardBody, CardSubtitle } from 'reactstrap';
import Gauge from 'react-svg-gauge';
import './styles/TemperatureCard.css';


export default class MemoryCard extends React.Component {

    bytesToSize(bytes) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
     }

    mapColor() {
        let usage = this.props.info.used / this.props.info.total;
        if(usage < 0.2) {
            return "#009F6B"
        } else if (usage >= 0.2 && usage < 0.4) {
            return "#969f00"
        } else if (usage >= 0.4 && usage < 0.6) {
            return "#FFD300"
        } else if (usage >= 0.6 && usage < 0.8) {
            return "#ffa400"
        } else {
            return "#C40233"
        }
    }

    render() {
        let valueStyle = {
            "textAnchor": "middle",
            "fill": "rgb(1, 1, 1)",
            "stroke": "none",
            "fontStyle": "normal",
            "fontVariant": "normal",
            "fontWeight": "bold",
            "fontStretch": "normal",
            "lineHeight": "normal",
            "fillOpacity": "1",
            "fontSize": "30px"
        }
        const { info: { used, total } } = this.props;
        let value = Math.round(used / Math.pow(1024, 3));
        let maxValue = Math.round(total / Math.pow(1024, 3));
        return (
            <Card>
                <CardHeader>
                    Memory (Bytes)
                </CardHeader>
                <CardBody>
                    <Gauge className="gauge" value={value}
                        color={this.mapColor()}
                        width={227} height={125} label=""
                        max={maxValue}
                        valueFormatter={value => `${this.bytesToSize(used)}`}
                        valueLabelStyle={valueStyle}
                    />
                </CardBody>
                <CardFooter>
                    Memory Usage: <b>{Math.round(100 * used / total, 2)}%</b>
                </CardFooter>
            </Card>
        );
    }
}
