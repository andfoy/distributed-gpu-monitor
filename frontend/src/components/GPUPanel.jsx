import React from 'react';
import {Card, Col, CardDeck, CardHeader, CardBody} from 'reactstrap';
import TemperatureCard from './cards/TemperatureCard';
import MemoryCard from './cards/MemoryCard';
import LoadCard from './cards/LoadCard';


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
                            <LoadCard info={this.props.gpu.load}/>
                        </CardDeck>
                        <div className="graph-container">
                            <Card>
                                <CardHeader>
                                    Processes
                                </CardHeader>
                            </Card>
                        </div>
                        <div className="graph-container">
                            <Card>
                                <CardHeader>
                                    Graphs
                                </CardHeader>
                            </Card>
                        </div>
                    </Col>) : ""}
                </CardBody>
            </Card>
        )
    }
}