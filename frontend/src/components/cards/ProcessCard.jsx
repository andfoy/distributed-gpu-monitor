
import React from 'react';
import {Card, CardHeader, CardBody, Table, Badge} from 'reactstrap';
import {bytesToSize} from './utils/Misc';

export default class ProcessCard extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader>
                    Processes
                </CardHeader>
                <CardBody>
                    <Table size="sm" responsive>
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>Username</th>
                            <th>Command</th>
                            <th>Memory Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.processes.map(p => {
                            return (
                                <tr key={p.pid}>
                                    <td>{p.pid}</td>
                                    <td><Badge color="primary">{p.user}</Badge></td>
                                    <td>{p.cmd}</td>
                                    <td>{bytesToSize(p.mem)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    </Table>
                </CardBody>
            </Card>
        );
    }
}