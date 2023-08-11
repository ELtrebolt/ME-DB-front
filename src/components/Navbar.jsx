import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavbarFunction = ({user}) => {

  const logout = () => {
    window.open("http://localhost:8082/auth/logout", "_self");
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
    {user ? (
      <Container>
        <Navbar.Brand href="/home">ME-DB</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link onClick={logout}>Logout</Nav.Link>
          <NavDropdown title="Dropdown" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">
              Another action
            </NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">
              Separated link
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Nav className="ml-auto">
          <Nav.Link>
            <img src={user.profilePic} className="avatar" alt=""/>
            {user.displayName}
          </Nav.Link>
        </Nav>
      </Container>
    )
    : (
      <Container>
        <Navbar.Brand href="/">ME-DB</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
        </Nav>
      </Container>
    )}
    </Navbar>
  );
}

export default NavbarFunction