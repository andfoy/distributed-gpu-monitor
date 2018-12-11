
import React from 'react';
import {ButtonGroup, Badge, Button, CardBody, UncontrolledTooltip} from 'reactstrap';

export default class GPUCard extends React.Component {

    colorSelector(procs) {
        return procs.length === 0 ? "success" : "danger";
    }

    clickBtn(machine, gpu) {
        this.props.updateDisplay(machine, gpu)();
    }

    render() {
        let gpus_info = this.props.gpus;
        let machine = this.props.hostname;
        let buttons = gpus_info.map(
            g =>
            <Button key={`${machine}_${g.gpu.id}_btn`}
                    color={this.colorSelector(g.procs)}
                    id={`${machine}_${g.gpu.id}`}
                    onClick={this.clickBtn.bind(this, machine, g)}>
                    GPU {g.gpu.id} <Badge color="secondary">{g.procs.length}</Badge>
            <UncontrolledTooltip placement="top" target={`${machine}_${g.gpu.id}`}>
                {g.gpu.model}
            </UncontrolledTooltip>
            </Button>)
        return (
            <CardBody>
            <ButtonGroup>
                {buttons}
            </ButtonGroup>
            </CardBody>
        );
    }
}
