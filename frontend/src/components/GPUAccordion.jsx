
import React from 'react';
import Sockette from 'sockette';
import {Card, CardHeader, CardTitle, CardBody} from 'reactstrap';
import GPUCard from './GPUCard';

export default class GPUAccordion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.socket = new Sockette('ws://127.0.0.1:8001/gpu/', {
            onmessage: this.updateInfo.bind(this),
            onerror: (evt) => {console.log(evt)}
        });
    }

    updateInfo(evt) {
        let msg = JSON.parse(evt.data);
        let key = msg['hostname'];
        let update = {};
        update[key] = msg;
        this.setState(update);
    }

    render() {
        let available_gpus = Object.keys(this.state);
        return (
            <div>
            {available_gpus.map(g => {
                var gpu = this.state[g]
                return (
                    <Card key={gpu.hostname}>
                    <CardHeader>
                        {gpu.hostname}
                    </CardHeader>
                    <GPUCard gpus={gpu.gpus} hostname={gpu.hostname}/>
                    </Card>
                )
            })}
            </div>
        );
    }
}