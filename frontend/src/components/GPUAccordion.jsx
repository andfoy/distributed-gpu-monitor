
import React from 'react';
import Sockette from 'sockette';
import { Card, CardHeader, Alert, Row, Col } from 'reactstrap';
import GPUCard from './GPUCard';
import './styles/GPUAccordion.css';
import GPUPanel from './GPUPanel';

export default class GPUAccordion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gpus: {},
            selectedGPU: null,
            currentMachine: null,
            tempSeries: []
        }
        let url = process.env.NODE_ENV !== 'production' ? "ws://127.0.0.1:8001/gpu/" : "ws://marr.uniandes.edu.co/gpu/gpu/"
        this.socket = new Sockette(url, {
            onmessage: this.updateInfo.bind(this),
            onerror: (evt) => { console.log(evt) },
            onclose: () => {console.log("Socket closed")}
        });
    }

    updateInfo(evt) {
        let msg = JSON.parse(evt.data);
        let key = msg['hostname'];
        let update = {...this.state.gpus};
        update[key] = msg;
        var currentMachine = this.state.currentMachine;
        var selectedGPU = this.state.selectedGPU;
        var tempSeries = this.state.tempSeries;
        if(key === this.state.currentMachine) {
            // console.log(msg.gpus);
            // console.log(selectedGPU);
            selectedGPU = msg.gpus[selectedGPU.gpu.id];
            let temp = selectedGPU.temp;
            tempSeries.push({
                time: Date.now(),
                temp: temp.temp,
                shutTemp: temp.shut_temp,
                slowTemp: temp.slow_temp});
        }
        this.setState({gpus: update, currentMachine: currentMachine,
                       selectedGPU: selectedGPU, tempSeries: tempSeries});
    }

    updateSelected(machine, gpu) {
        console.log(machine);
        console.log(gpu);
        let temp = gpu.temp;
        let tempSeries = [
            {
                time: Date.now(),
                temp: temp.temp,
                shutTemp: temp.shut_temp,
                slowTemp: temp.slow_temp
            }
        ]
        this.setState({currentMachine: machine, selectedGPU: gpu, tempSeries: tempSeries});
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
                                  gpu={this.state.selectedGPU}
                                  tempSeries={this.state.tempSeries}
                                  />
                    </Col>
                </Row>
            </Col>
        );
    }
}