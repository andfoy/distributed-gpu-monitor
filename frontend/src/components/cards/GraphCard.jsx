import React from 'react'
import {
    Card, CardFooter, CardHeader, CardBody,
    CardSubtitle, Button, ButtonGroup
} from 'reactstrap';
import Axios from 'axios';
import TimeGraph from '../graphs/TimeGraph';
import Moment from 'moment-timezone';


const periods = {
    "7d": "week",
    "24h": "day",
    "1h": "hour",
    "now": "now"
}

export default class GraphCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTime: "now",
            dataPoints: []
        }
    }

    componentDidMount() {
        this.retrievePoints(this.state.selectedTime);
    }

    componentDidUpdate(prevProps) {
        if (this.props.machine !== prevProps.machine) {
            this.retrievePoints();
        } else if (this.props.gpuid !== prevProps.gpuid) {
            this.retrievePoints(this.state.selectedTime);
        }
    }

    retrievePoints(namedPeriod) {
        let timePeriod = periods[namedPeriod]
        if (timePeriod !== "now") {
            let tz = Moment.tz.guess()
            let now = Moment().tz(tz);
            let startDate = now.startOf(timePeriod);
            let startISO = startDate.format()
            let endDate = startDate.add(1, timePeriod);
            let requestBody = {
                machine: this.props.machine,
                gpuid: this.props.gpuid,
                period: timePeriod,
                start_timestamp: startISO,
                end_timestamp: endDate.format()
            }
            Axios.post('/graphs', requestBody).then((response) => {
                let body = response.data;
                let points = body.map((m) => {
                    let values = m.values[this.props.name]
                    let measurementInfo = this.props.mapping['measurement']
                    let upperLimitInfo = this.props.mapping['upperLimit']
                    let middleLimitInfo = this.props.mapping['middleLimit']
                    let timestamp = Moment.tz(m.values.timestamp, 'UTC').tz(tz);
                    // toDate
                    var nestedValues = values instanceof Object
                    var measurement = {
                        value: nestedValues ? values[measurementInfo['key']] : values,
                        label: measurementInfo['label']
                    }
                    var upperLimit = {
                        value: 100,
                        label: "Maximum value"
                    };
                    var middleLimit = {
                        value: 0,
                        label: "Minimum value"
                    };
                    if (upperLimitInfo !== undefined) {
                        upperLimit = {
                            value: values[upperLimitInfo['key']],
                            label: upperLimitInfo['label']
                        }
                    }
                    if (middleLimitInfo !== undefined) {
                        middleLimit = {
                            value: values[middleLimitInfo['key']],
                            label: middleLimitInfo['label']
                        }
                    }
                    let ret = {
                        measurement: measurement,
                        upperLimit: upperLimit,
                        middleLimit: middleLimit,
                        timestamp: timestamp.toDate()
                    }
                    return ret;
                })
                this.setState({ dataPoints: points });
            })
        }
        this.setState({ selectedTime: namedPeriod })
    }

    render() {
        let isLiveOn = this.state.selectedTime === "now";
        return (
            <Card>
                <CardHeader>{this.props.title}</CardHeader>
                <CardBody>
                    <TimeGraph mapping={this.props.mapping}
                        series={!isLiveOn ? this.state.dataPoints : this.props.live} />
                </CardBody>
                <CardFooter>
                    <ButtonGroup>
                        {Object.keys(periods).map(p =>
                            <Button key={`${this.props.name}.${p}`} color={this.state.selectedTime === p ? "primary" : "secondary"}
                                size="sm" onClick={this.retrievePoints.bind(this, p)}>
                                {p}
                            </Button>)}
                    </ButtonGroup>
                </CardFooter>
            </Card>
        );
    }
}