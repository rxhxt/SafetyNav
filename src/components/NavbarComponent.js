import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

const NavbarComponent = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="http://localhost:3000/">Your Logo</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link href="http://localhost:3000/">Home</Nav.Link>
          <Nav.Link href="http://localhost:3000/routing">Routing</Nav.Link>
          <Nav.Link href="http://localhost:3000/complaint">Complaint</Nav.Link>
          {/* <Nav.Link href="#contact">Contact</Nav.Link> */}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavbarComponent;
