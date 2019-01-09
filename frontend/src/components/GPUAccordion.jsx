
import React from 'react';
import Sockette from 'sockette';
import { Card, CardHeader, Alert, Row, Col } from 'reactstrap';
import GPUCard from './GPUCard';
import './styles/GPUAccordion.css';
import GPUPanel from './GPUPanel';

export default class GPUAccordion extends React.Component {
    constructor(props) {
        super(props);
        let machines = process.env.REACT_APP_MACHINES.split(",")
        this.state = {
            gpus: {},
            selectedGPU: null,
            currentMachine: null,
            tempSeries: [],
            downMachines: {},
            lastContact: machines.reduce((acc, val) => {
                acc[val] = null;
                return acc;
            }, {})
        }
        this.checkLastContact = this.checkLastContact.bind(this);
        let url = process.env.NODE_ENV !== 'production' ? "ws://127.0.0.1:8001/gpu/" : "ws://marr.uniandes.edu.co/gpu/gpu/"
        this.socket = new Sockette(url, {
            onmessage: this.updateInfo.bind(this),
            onerror: (evt) => { console.log(evt) },
            onclose: () => {console.log("Socket closed")}
        });
        setInterval(this.checkLastContact, 200);
    }

    checkLastContact() {
        var machines = Object.keys(this.state.lastContact);
        let downMachines = machines.reduce((acc, val) => {
            if(Date.now() - this.state.lastContact[val] <= 500) {
                acc[val] = val;
            }
            return acc;
        }, {});
        this.setState({downMachines: downMachines});
    }

    updateInfo(evt) {
        let msg = JSON.parse(evt.data);
        let key = msg['hostname'];
        let update = {...this.state.gpus};
        update[key] = msg;
        var currentMachine = this.state.currentMachine;
        var selectedGPU = this.state.selectedGPU;
        var tempSeries = this.state.tempSeries;
        var lastContact = {...this.state.lastContact};
        let downMachines = {...this.state.downMachines};
        lastContact[key] = Date.now();

        if(downMachines[key] !== undefined) {
            ({key, ...downMachines} = downMachines);
        }

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
                       selectedGPU: selectedGPU, tempSeries: tempSeries,
                       lastContact: lastContact, downMachines: downMachines});
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
        var downMachines = Object.keys(this.state.downMachines);
        var areDownMachines = downMachines.length > 0;
        var statusMsg = "All systems online!";
        if(areDownMachines) {
            let [first, ...rest] = downMachines;
            statusMsg = `${first} is down!`;
            if(rest.length > 0) {
                let head = downMachines.slice(0, -1);
                let last = downMachines[downMachines.length - 1];
                statusMsg = `${head.join(", ")} and ${last} are down!`;
            }
        }
        return (
            <Col md={12}>
                <Alert color={"success" ? areDownMachines : "warning"}>
                    {statusMsg}
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