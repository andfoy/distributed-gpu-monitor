import React from 'react';
import { Card, CardFooter, CardHeader, CardBody, CardSubtitle } from 'reactstrap';
import Gauge from 'react-svg-gauge';
import './styles/TemperatureCard.css';


export default class LoadCard extends React.Component {
    mapColor() {
        let usage = this.props.info / 100.0
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
        return (
            <Card>
                <CardHeader>
                    Fan (%)
                </CardHeader>
                <CardBody>
                    <Gauge className="gauge" value={this.props.info}
                        color={this.mapColor()}
                        width={227} height={125} label=""
                        max={100}
                        valueFormatter={value => `${value}%`}
                        valueLabelStyle={valueStyle}
                    />
                </CardBody>
                <CardFooter>
                    Load: <b>{this.props.load}%</b>
                </CardFooter>
            </Card>
        );
    }
}