import React, {Component} from 'react';
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  NavItem
} from 'reactstrap';

import './styles/NavBar.css'


export default class NavBar extends React.Component {
    constructor(props) {
      super(props);
      this.props = props;
      this.state = {
        text: "Text"
      }
    }

    render() {
      return (
        <div>
          <Navbar color="dark" className="navbar-fixed-top navbar-custom navbar-dark navbar-bg">
            <NavbarBrand href="https://biomedicalcomputervision.uniandes.edu.co">
            <img src="https://biomedicalcomputervision.uniandes.edu.co/images/logo_uniandes_w.png" height="60"/>
              Distributed GPU Monitor
            </NavbarBrand>
          </Navbar>
        </div>
      );
    }
}
