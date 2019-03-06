
import React from 'react';
import Plot from 'react-plotly.js';


function unpack(series, key) {
    return series.map((row) => { return row[key] });
}

export default class TimePlotly extends React.Component {
    render() {
        let measurements = this.props.series.map(
            e => { return { x: e.timestamp, y: e.measurement.value, l: e.measurement.label } })
        let middleLimits = this.props.series.map(
            e => { return { x: e.timestamp, y: e.middleLimit.value, l: e.middleLimit.label } })
        let upperLimits = this.props.series.map(
            e => { return { x: e.timestamp, y: e.upperLimit.value, l: e.upperLimit.label } })

        var points = [measurements, middleLimits, upperLimits]
        let plots = points.map(p => {
            return {
                type: 'scattergl',
                mode: 'lines',
                name: p.length > 0 ? p[0].l : "",
                x: unpack(p, "x"),
                y: unpack(p, "y"),
                connectgaps: true
            }
        })
        return (
            <Plot
                data={plots}
                layout={{ margin: {t: 0}}}
            />)
    }
}