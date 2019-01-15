
import React from 'react';
// import {Card, CardHeader, CardBody} from 'reactstrap';
import { VictoryChart, VictoryVoronoiContainer, VictoryTooltip, VictoryLine, VictoryTheme } from 'victory';

export default class TimeGraph extends React.Component {
    render() {
        return (
            <VictoryChart height={220} width={420} padding={{left: 40, right: 10, top: 5, bottom: 30}}
                scale={{ x: "time" }}
                domainPadding={{ y: 10 }}
                minDomain={{y: 0}}
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        voronoiDimension="x"
                        labels={(d) => `${d.l}: ${d.y.toFixed(2)}`}
                        labelComponent={
                            <VictoryTooltip
                                cornerRadius={0}
                                flyoutStyle={{ fill: "white" }}
                            />}
                    />}
            >
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.timestamp, y: e.measurement.value, l: e.measurement.label } })}
                    style={{
                        data: {
                            stroke: "blue",
                            strokeWidth: (d, active) => { return active ? 4 : 2; }
                        },
                        labels: { fill: "blue" }
                    }}
                />
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.timestamp, y: e.middleLimit.value, l:  e.middleLimit.label} })}
                    style={{
                        data: {
                            stroke: "tomato",
                            strokeWidth: (d, active) => { return active ? 4 : 2; }
                        },
                        labels: { fill: "tomato" }
                    }}
                />
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.timestamp, y: e.upperLimit.value, l: e.upperLimit.label } })}
                    style={{
                        data: {
                            stroke: "black",
                            strokeWidth: (d, active) => { return active ? 4 : 2; }
                        },
                        labels: { fill: "black" }
                    }}
                />
            </VictoryChart>
        )
    }
}