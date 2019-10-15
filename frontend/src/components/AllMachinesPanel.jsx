
import React from 'react'
import { Card, CardHeader, Row, Col, Button, CardBody, ButtonGroup } from 'reactstrap'
import './styles/AllMachinesPanel.css'

const mod = (n, m) => {
    return ((n % m) + m) % m
}


export default class AllMachinesPanel extends React.Component {
    constructor(props) {
        super(props)
        const { machines } = props
        let machineNames = Object.keys(machines)
        const [ firstSelection, ] = machineNames.sort()
        this.state = {
            position: 0,
            currentSelection: firstSelection
        }
    }

    handlers = {
        "ArrowLeft": () => this.updateMachinePosition(-1),
        "ArrowRight": () => this.updateMachinePosition(1)
    }

    updateMachinePosition = (delta) => {
        const { machines } = this.props
        const { position } = this.state
        let machineNames = Object.keys(machines).sort()
        let totalMachines = machineNames.length
        const newPosition = mod(position + delta, totalMachines)
        const newSelection = machineNames[newPosition]
        this.setState({ position: newPosition, currentSelection: newSelection })
    }

    _handleKeyDown = (event) => {
        const { key } = event
        const handler = this.handlers[key]
        if(handler) {
            handler()
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this._handleKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown)
    }


    updateSelection = (selectionName, index) => {
        this.setState({currentSelection: selectionName, position: index})
    }

    render() {
        const { machines } = this.props
        const { currentSelection } = this.state
        let machineNames = Object.keys(machines);
        machineNames = machineNames.sort();
        return (
            <Col md={12}>
                <Row className="all-machines-row">
                    <Card className="all-machines-top">
                        <CardHeader>Machines</CardHeader>
                        <CardBody>
                            <ButtonGroup>
                                {machineNames.map((machineName, index) => {
                                    const machine = machines[machineName]
                                    const isSelection = currentSelection === machineName
                                    return (
                                        <Button key={machine.hostname}
                                                color={isSelection ? "primary" : "secondary"}
                                                onClick={_ => this.updateSelection(machineName, index)}>
                                            {machine.hostname}
                                        </Button>
                                    )
                                })}
                            </ButtonGroup>
                        </CardBody>
                    </Card>
                </Row>
                <Row>
                    <Card className="all-machines-top">
                        <CardHeader>Graphs</CardHeader>
                    </Card>
                </Row>
            </Col>
        )
    }
}
