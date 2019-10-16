
import React from 'react'
import Axios from 'axios'
import { Card, CardHeader, Row, Col, Button, CardBody, ButtonGroup } from 'reactstrap'
import MultiLineGraph from './MultiLineGraph'
import Moment from 'moment-timezone'

const GRAPH_ENDPOINT = process.env.NODE_ENV !== 'production' ? '/allgraphs' : '/gpu/allgraphs'


export default class MachineGraphs extends React.PureComponent {
    state = {
        tempGraph: [],
        fanGraph: []
    }

    componentDidMount() {
        const { selectedTime } = this.props
        this.retrievePoints(selectedTime)
    }

    componentDidUpdate(prevProps) {
        const { selectedTime } = this.props

        if (this.props.machine !== prevProps.machine) {
            this.retrievePoints(selectedTime)
        }
    }

    retrievePoints = (timePeriod) => {
        const { machine } = this.props
        const tz = Moment.tz.guess()
        const now = Moment().tz(tz);
        // const startDate = now.startOf(timePeriod);
        const endDate = now
        const endISO = endDate.format()
        // const endDate = startDate.add(1, timePeriod);
        const startDate = endDate.subtract(1, timePeriod)
        const startISO = startDate.format()
        const requestBody = {
            machine: machine,
            period: timePeriod,
            start_timestamp: startISO,
            end_timestamp: endISO
        }
        Axios.post(GRAPH_ENDPOINT, requestBody).then((response) => {
            const machineData = response.data
            let minSlowdown = Infinity
            let maxShutdown = 0
            // let minFanBounds = []
            let maxFanBounds = []
            let minTempBounds = []
            let maxTempBounds = []
            const machinePoints = machineData.map(machine => {
                const { _id: gpuID, values } = machine
                let tempPoints = []
                let fanPoints = []
                values.map(value => {
                    const { temp: { value: tempValue, slowdown, shutdown }, fan, timestamp } = value
                    minSlowdown = Math.min(minSlowdown, slowdown)
                    maxShutdown = Math.max(maxShutdown, shutdown)
                    tempPoints.push({
                        value: tempValue,
                        timestamp: timestamp,
                        label: `GPU${gpuID}`
                    })
                    fanPoints.push({
                        value: fan,
                        timestamp: timestamp,
                        label: `GPU${gpuID}`
                    })
                    // minFanBounds.push({
                    //     value: 0,
                    //     timestamp: timestamp,
                    //     label: "Minimum Fan Speed"
                    // })
                    maxFanBounds.push({
                        value: 100,
                        timestamp: timestamp,
                        label: "Maximum Fan Speed"
                    })
                })
                return { tempPoints: tempPoints, fanPoints: fanPoints }
            })
            const tempSeries = machinePoints.map(points => {
                const { tempPoints } = points
                tempPoints.map(temp => {
                    const { timestamp } = temp
                    minTempBounds.push({
                        value: minSlowdown,
                        timestamp: timestamp,
                        label: "Slowdown"
                    })
                    maxTempBounds.push({
                        value: maxShutdown,
                        timestamp: timestamp,
                        label: "Shutdown"
                    })
                })
                return tempPoints
            })
            const fanSeries = machinePoints.map(points => {
                const { fanPoints } = points
                return fanPoints
            })

            const tempGraph = [...tempSeries, minTempBounds, maxTempBounds]
            const fanGraph = [...fanSeries, maxFanBounds]
            this.setState({ tempGraph: tempGraph, fanGraph: fanGraph})
        })
    }

    render() {
        const { tempGraph, fanGraph } = this.state
        const { machine } = this.props
        return (<Row>
            <Col md={6}>
                <MultiLineGraph lines={tempGraph}
                    title={`Temperature (${machine})`}
                    showLegend={true}
                    xaxis=""
                    yaxis="Temperature (°C)"
                />
            </Col>
            <Col md={6}>
                <MultiLineGraph lines={fanGraph}
                    title={`Fan Usage (${machine})`}
                    showLegend={true}
                    xaxis=""
                    yaxis="Fan (%)"
                />
            </Col>
        </Row>)
    }
}
