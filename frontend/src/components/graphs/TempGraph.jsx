
import React from 'react';
// import {Card, CardHeader, CardBody} from 'reactstrap';
import { VictoryChart, VictoryVoronoiContainer, VictoryTooltip, VictoryLine } from 'victory';

export default class TempGraph extends React.Component {
    render() {
        return (
            <VictoryChart height={200} width={420}
                scale={{ x: "time" }}
                domainPadding={{ y: 10 }}
                containerComponent={
                    <VictoryVoronoiContainer
                        voronoiDimension="x"
                        labels={(d) => `${d.l}: ${d.y}`}
                        labelComponent={
                            <VictoryTooltip
                                cornerRadius={0}
                                flyoutStyle={{ fill: "white" }}
                            />}
                    />}
            >
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.time, y: e.temp, l: "Temp" } })}
                    style={{
                        data: {
                            stroke: "blue",
                            strokeWidth: (d, active) => { return active ? 4 : 2; }
                        },
                        labels: { fill: "blue" }
                    }}
                />
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.time, y: e.slowTemp, l: "Slowdown Temp" } })}
                    style={{
                        data: {
                            stroke: "tomato",
                            strokeWidth: (d, active) => { return active ? 4 : 2; }
                        },
                        labels: { fill: "tomato" }
                    }}
                />
                <VictoryLine
                    data={this.props.series.map(e => { return { x: e.time, y: e.shutTemp, l: "Shutdown Temp" } })}
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