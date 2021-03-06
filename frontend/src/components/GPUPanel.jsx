import React from 'react';
import {Card, Col, CardDeck, CardHeader, CardBody, CardFooter} from 'reactstrap';
import TemperatureCard from './cards/TemperatureCard';
import MemoryCard from './cards/MemoryCard';
import LoadCard from './cards/LoadCard';
import ProcessCard from './cards/ProcessCard';
import GraphCard from './cards/GraphCard';
// import TempGraph from './graphs/TimeGraph';


const graphMapping = {
    "temp": {
        "measurement": {
            key: "value",
            label: "Temp (°C)"
        },
        upperLimit: {
            key: "shutdown",
            label: "Shutdown Temp"
        },
        middleLimit: {
            key: "slowdown",
            label: "Slowdown Temp"
        }
    },
    "fan": {
        "measurement": {
            key: "fan",
            label: "Fan speed (%)"
        }
    }
}

export default class GPUPanel extends React.Component {
    render() {
        const { gpu, machine, tempSeries } = this.props;
        var id, model, temp, mem, load, fan, procs
        if(gpu !== null) {
            var { gpu: {id, model}, temp, mem, load, temp: {fan}, procs} = gpu;
        }
        return (
            <Card>
                <CardHeader>
                    {gpu !== null ? `${machine}: GPU${id} [${model}]` : "GPU Info"}
                </CardHeader>
                <CardBody>
                    {gpu !== null ? (<Col xs={12}>
                        <CardDeck>
                            <TemperatureCard info={temp}/>
                            <MemoryCard info={mem}/>
                            <LoadCard load={load}
                                      info={fan}
                            />
                        </CardDeck>
                        <div className="graph-container">
                            <ProcessCard processes={procs}/>
                        </div>
                        <div className="graph-container">
                            <GraphCard title="Temperature Graph"
                                       graphTitle={`Temperature (${machine}: GPU${id})`}
                                       name="temp"
                                       machine={machine}
                                       gpuid={id}
                                       mapping={graphMapping.temp}
                                       live={tempSeries.temp}
                                       showLegend={false}
                                       xaxis="Timestamp"
                                       yaxis="Temperature (°C)"
                            />
                        </div>
                        <div className="graph-container">
                            <GraphCard title="Fan Usage Graph"
                                       graphTitle={`Fan Usage (${machine}: GPU${id})`}
                                       name="fan"
                                       machine={machine}
                                       gpuid={id}
                                       mapping={graphMapping.fan}
                                       live={tempSeries.fan}
                                       showLegend={false}
                                       xaxis="Timestamp"
                                       yaxis="Fan (%)"
                            />
                        </div>
                    </Col>) : ""}
                </CardBody>
            </Card>
        )
    }
}
