import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="header">
      <Navbar.Brand href="/">Hệ thống quản lý sản xuất</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link href="/profile">Tài khoản</Nav.Link>
          <Nav.Link href="/logout">Đăng xuất</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
