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
        return (
            <Card>
                <CardHeader>
                    {this.props.gpu !== null ? `${this.props.machine}: GPU${this.props.gpu.gpu.id} [${this.props.gpu.gpu.model}]` : "GPU Info"}
                </CardHeader>
                <CardBody>
                    {this.props.gpu !== null ? (<Col xs={12}>
                        <CardDeck>
                            <TemperatureCard info={this.props.gpu.temp}/>
                            <MemoryCard info={this.props.gpu.mem}/>
                            <LoadCard load={this.props.gpu.load}
                                      info={this.props.gpu.temp.fan}
                            />
                        </CardDeck>
                        <div className="graph-container">
                            <ProcessCard processes={this.props.gpu.procs}/>
                        </div>
                        <div className="graph-container">
                            <GraphCard title="Temperature Graph"
                                       name="temp"
                                       machine={this.props.machine}
                                       gpuid={this.props.gpu.gpu.id}
                                       mapping={graphMapping.temp}
                            />
                        </div>
                        <div className="graph-container">
                            <GraphCard title="Fan Usage Graph"
                                       name="fan"
                                       machine={this.props.machine}
                                       gpuid={this.props.gpu.gpu.id}
                                       mapping={graphMapping.fan}
                            />
                        </div>
                    </Col>) : ""}
                </CardBody>
            </Card>
        )
    }
}