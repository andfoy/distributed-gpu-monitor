
import React from 'react';
import Sockette from 'sockette';
import { Card, CardHeader, Alert, Row, Col } from 'reactstrap';
import Moment from 'moment-timezone';
import GPUCard from './GPUCard';
import GPUPanel from './GPUPanel';
import './styles/GPUAccordion.css';

export default class GPUAccordion extends React.Component {
    constructor(props) {
        super(props);
        let machines = process.env.REACT_APP_MACHINES.split(",")
        this.state = {
            gpus: {},
            selectedGPU: null,
            currentMachine: null,
            tempSeries: {
                temp: [],
                fan: []
            },
            lastSelection: null,
            downMachines: {},
            lastContact: machines.reduce((acc, val) => {
                acc[val] = null;
                return acc;
            }, {})
        }
        this.checkLastContact = this.checkLastContact.bind(this);
        setInterval(this.checkLastContact, 200);
        let url = process.env.NODE_ENV !== 'production' ? "ws://127.0.0.1:8001/gpu/" : "ws://marr.uniandes.edu.co/gpu/gpu/"
        this.socket = new Sockette(url, {
            onmessage: this.updateInfo.bind(this),
            onerror: (evt) => { console.log(evt) },
            onclose: () => {console.log("Socket closed")}
        });
    }

    checkLastContact() {
        var machines = Object.keys(this.state.lastContact);
        var gpuUpdate = {...this.state.gpus};
        var selectedGPU = this.state.selectedGPU;
        var currentMachine = this.state.currentMachine;
        var tempSeries = this.state.tempSeries;
        var lastSelection = this.state.lastSelection;
        var lastContact = this.state.lastContact;
        let downMachines = machines.reduce((acc, val) => {
            if(this.state.lastContact[val] === null || Date.now() - this.state.lastContact[val] > 5000) {
                acc[val] = val;
            }
            return acc;
        }, {});

        gpuUpdate = Object.keys(downMachines).reduce((acc, val) => {
            // ({val, ...acc} = acc);
            delete acc[val];
            // console.log(acc);
            return acc
        }, gpuUpdate);

        if(downMachines[currentMachine] !== undefined) {
            lastContact[currentMachine] = null;
            currentMachine = null;
            selectedGPU = null;
            tempSeries = {
                temp: [],
                fan: []
            };
            lastSelection = null;
        }
        this.setState({gpus: gpuUpdate, downMachines: downMachines,
                       selectedGPU: selectedGPU, tempSeries: tempSeries,
                       currentMachine: currentMachine, lastSelection: lastSelection,
                       lastContact: lastContact});
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
            // let temp = selectedGPU.temp;
            // let time = Moment();
            // let diff = time.diff(this.state.lastSelection, 'minutes')
            // tempSeries.temp.push({
            //     timestamp: time,
            //     measurement: {
            //         value: temp.temp,
            //         label: "Temp (°C)"
            //     },
            //     middleLimit: {
            //         value: temp.slow_temp,
            //         label: "Slowdown Temp"
            //     },
            //     upperLimit: {
            //         value: temp.shut_temp,
            //         label: "Shutdown Temp"
            //     }
            // });
            // tempSeries.fan.push({
            //     timestamp: time,
            //     measurement: {
            //         value: temp.fan,
            //         label: "Fan (%)"
            //     },
            //     upperLimit : {
            //         value: 100,
            //         label: "Maximum value"
            //     },
            //     middleLimit: {
            //         value: 0,
            //         label: "Minimum value"
            //     }
            // });

            // if(diff > 1) {
            //     tempSeries.temp.shift();
            //     tempSeries.fan.shift();
            // }
            // tempSeries.push({
            //     time: Date.now(),
            //     temp: temp.temp,
            //     shutTemp: temp.shut_temp,
            //     slowTemp: temp.slow_temp});
        }
        this.setState({gpus: update, currentMachine: currentMachine,
                       selectedGPU: selectedGPU, tempSeries: tempSeries,
                       lastContact: lastContact, downMachines: downMachines});
    }

    updateSelected(machine, gpu) {
        let temp = gpu.temp;
        let lastSelection = Moment()
        let tempSeries = {
            temp: [{
                timestamp: Date.now(),
                measurement: {
                    value: temp.temp,
                    label: "Temp (°C)"
                },
                middleLimit: {
                    value: temp.slow_temp,
                    label: "Slowdown Temp"
                },
                upperLimit: {
                    value: temp.shut_temp,
                    label: "Shutdown Temp"
                }
            }],
            fan: [{
                timestamp: Date.now(),
                measurement: {
                    value: temp.fan,
                    label: "Fan (%)"
                },
                upperLimit : {
                    value: 100,
                    label: "Maximum value"
                },
                middleLimit: {
                    value: 0,
                    label: "Minimum value"
                }
            }]
        }
        this.setState({currentMachine: machine, selectedGPU: gpu,
                       tempSeries: tempSeries, lastSelection: lastSelection});
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
                <Alert color={!areDownMachines ? "success" : "warning"}>
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