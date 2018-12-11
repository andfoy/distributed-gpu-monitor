import React from 'react';
import {Card, Col, CardDeck, CardHeader, CardBody} from 'reactstrap';
import TemperatureCard from './cards/TemperatureCard';


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
                            <Card>
                                <CardHeader>
                                    Memory
                                        </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    Processes
                                        </CardHeader>
                            </Card>
                        </CardDeck>
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