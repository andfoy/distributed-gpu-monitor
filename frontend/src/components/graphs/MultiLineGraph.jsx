
import React from 'react';
import Plotly from 'plotly.js';
import Plot from 'react-plotly.js';

function unpack(series, key) {
    return series.map((row) => { return row[key] });
}

export default class MultiLineGraph extends React.Component {
    render() {
        const { lines, showLegend, xaxis, yaxis, title } = this.props
        let plots = lines.map(line => {
            return {
                type: 'scattergl',
                mode: 'lines',
                name: line.length > 0 ? line[0].label : "",
                x: unpack(line, "timestamp"),
                y: unpack(line, "value"),
                connectgaps: true
            }
        })
        return (
            <Plot
                data={plots}
                layout={{
                    margin: { t: 30, b: 40, l: 50, r: 30 },
                    showlegend: showLegend,
                    yaxis: { rangemode: 'tozero', title: { text: yaxis } },
                    xaxis: { title: { text: xaxis } },
                    title: title
                }}
            />)
    }
}