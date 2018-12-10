
import React from 'react';
import {ButtonGroup, Badge, Button, CardBody, UncontrolledTooltip} from 'reactstrap';

export default class GPUCard extends React.Component {

    colorSelector(procs) {
        return procs.length === 0 ? "success" : "danger";
    }

    render() {
        let gpus_info = this.props.gpus;
        let machine = this.props.hostname;
        let buttons = gpus_info.map(
            g => <ButtonGroup>
            <Button key={`${machine}_${g.gpu.id}_btn`}
                    color={this.colorSelector(g.procs)}
                    id={`${machine}_${g.gpu.id}`}>
                    GPU {g.gpu.id} <Badge color="secondary">{g.procs.length}</Badge>
            </Button>
            <UncontrolledTooltip placement="top" target={`${machine}_${g.gpu.id}`}>
                {g.gpu.model}
            </UncontrolledTooltip>
            </ButtonGroup>)
        return (
            <CardBody>
                {buttons}
            </CardBody>
        );
    }
}
