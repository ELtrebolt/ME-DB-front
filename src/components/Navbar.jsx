import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
const constants = require('../constants');

const NavbarFunction = ({user}) => {

  const logout = () => {
    window.open(constants['SERVER_URL'] + "/auth/logout", "_self");
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
    {user ? (
      <Container>
        <Navbar.Brand href="/anime/collection">ME-DB</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link onClick={logout}>Logout</Nav.Link>
          <NavDropdown title="Media" id="basic-nav-dropdown">
            <NavDropdown.Item href="/anime/collection">Anime</NavDropdown.Item>
            <NavDropdown.Item href="/tv/collection">TV Shows</NavDropdown.Item>
            <NavDropdown.Item href="/movies/collection">Movies</NavDropdown.Item>
            <NavDropdown.Item href="/games/collection">Games</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/music/collection">Music</NavDropdown.Item>
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