import React from 'react';
import { Card, CardFooter, CardHeader, CardBody, CardSubtitle } from 'reactstrap';
import Gauge from 'react-svg-gauge';
import './styles/TemperatureCard.css';


export default class TemperatureCard extends React.Component {
    mapColor() {
        if (this.props.info.temp < this.props.info.slow_temp) {
            return "#009F6B"
        } else if (this.props.info.temp >= this.props.info.slow_temp && this.props.info.temp < this.props.info.shut_temp) {
            return "#FFD300"
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
        return (
            <Card>
                <CardHeader>
                    Temperature (°C)
                </CardHeader>
                <CardBody>
                    <Gauge className="gauge" value={this.props.info.temp}
                        color={this.mapColor()}
                        width={227} height={125} label=""
                        max={this.props.info.shut_temp}
                        valueFormatter={value => `${value}°C`}
                        valueLabelStyle={valueStyle}
                    />
                </CardBody>
                <CardFooter>
                    Slowdown Temp: <b>{this.props.info.slow_temp}°C</b> - Shutdown Temp: <b>{this.props.info.shut_temp}°C</b>
                </CardFooter>
            </Card>
        );
    }
}