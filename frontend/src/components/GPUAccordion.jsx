
import React from 'react';
import Sockette from 'sockette';
import { Card, CardHeader, Alert, Row, Col, CardDeck, CardBody } from 'reactstrap';
import GPUCard from './GPUCard';
import './styles/GPUAccordion.css';
import Gauge from 'react-svg-gauge';
import GPUPanel from './GPUPanel';

export default class GPUAccordion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gpus: {},
            selectedGPU: null,
            currentMachine: null
        }
        this.socket = new Sockette('ws://127.0.0.1:8001/gpu/', {
            onmessage: this.updateInfo.bind(this),
            onerror: (evt) => { console.log(evt) }
        });
    }

    updateInfo(evt) {
        let msg = JSON.parse(evt.data);
        let key = msg['hostname'];
        let update = {...this.state.gpus};
        update[key] = msg;
        var currentMachine = this.state.currentMachine;
        var selectedGPU = this.state.selectedGPU;
        if(key === this.state.currentMachine) {
            // console.log(msg.gpus);
            // console.log(selectedGPU);
            selectedGPU = msg.gpus[selectedGPU.gpu.id];
        }
        this.setState({gpus: update, currentMachine: currentMachine, selectedGPU: selectedGPU});
    }

    updateSelected(machine, gpu) {
        console.log(machine);
        console.log(gpu);
        this.setState({currentMachine: machine, selectedGPU: gpu});
    }

    render() {
        var available_gpus = Object.keys(this.state.gpus);
        available_gpus = available_gpus.sort();
        var clickFunc = (machine, gpu) => this.updateSelected.bind(this, machine, gpu);
        return (
            <Col md={12}>
                <Alert color="success">
                    All systems online!
                    </Alert>
                <Row>
                    <Col md={4}>
                        <div>
                            {available_gpus.map(g => {
                                var gpu = this.state.gpus[g]
                                return (
                                    <Card key={gpu.hostname}>
                                        <CardHeader>
                                            {gpu.hostname}
                                        </CardHeader>
                                        <GPUCard gpus={gpu.gpus} hostname={gpu.hostname}
                                                 updateDisplay={clickFunc}/>
                                    </Card>
                                )
                            })}
                        </div>
                    </Col>
                    <Col md={8}>
                        <GPUPanel machine={this.state.currentMachine}
                                  gpu={this.state.selectedGPU}/>
                    </Col>
                </Row>
            </Col>
        );
    }
}