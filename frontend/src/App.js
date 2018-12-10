import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Row } from 'reactstrap';
import NavBar from './components/NavBar';
import GPUAccordion from './components/GPUAccordion';

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar/>
        {/* <Container> */}
        <div className="app-content">
          <Row>
          <GPUAccordion/>
            {/* <Col xs="6">
              <ImageCard image={this.state.image} imgWidth={this.state.width}
                        imgHeight={this.state.height} title="Title"
                        resizeCount={this.state.resizeCount} />
            </Col>
            <Col xs="6">
              <MyJumbotron updateText={this.update.bind(this)}/>
            </Col> */}
          </Row>
        </div>
        {/* </Container> */}
      </div>
    );
  }
}

export default App;
