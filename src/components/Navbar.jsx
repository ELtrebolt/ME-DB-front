import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import NewTypeModal from "../components/NewTypeModal";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const constants = require('../constants');

const NavbarFunction = ({user, setUserChanged, newTypes}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [navNewTypes, setNavNewTypes] = useState(newTypes);

  const showNewTypeModal = () => {
    setShowModal(true);
  }
  const onCreateNewType = (newName) => {
    newName = newName.trim().toLowerCase().replace(/ /g, '-')
    if(user.newTypes[newName]) {
      window.alert('Type Already Exists')
    } else {
      console.log('PUT /api/user/newTypes')
      axios
        .put(constants['SERVER_URL'] + `/api/user/newTypes`, {newType: newName})
        .then((res) => {
          console.log("Created New Type:", newName);
          setNavNewTypes(Object.keys(res.data.newTypes));
          setUserChanged(true);
          navigate(`/${newName}/collection`);
        })
        .catch((err) => {
          console.log(err);
          window.alert("Create New Type Failed");
        });
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
    {user ? (
      <Container>
        <NewTypeModal show={showModal} setShow={setShowModal} onSaveClick={onCreateNewType}></NewTypeModal>
        <Navbar.Brand href="/anime/collection">ME-DB</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
          <NavDropdown title="Media" id="basic-nav-dropdown">
            <NavDropdown.Item href="/anime/collection">Anime</NavDropdown.Item>
            <NavDropdown.Item href="/tv/collection">TV Shows</NavDropdown.Item>
            <NavDropdown.Item href="/movies/collection">Movies</NavDropdown.Item>
            <NavDropdown.Item href="/games/collection">Games</NavDropdown.Item>
            { navNewTypes.length > 0 ? <NavDropdown.Divider/> : null}
            {navNewTypes.length > 0 ? 
              navNewTypes.map((item, index) => (
              <NavDropdown.Item key={index} href={`/${item}/collection`}>{item.charAt(0).toUpperCase() + item.slice(1)}</NavDropdown.Item>
            )) : null}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={showNewTypeModal}>Add New</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Nav className="ml-auto">
          <Nav.Link href='/logout'>Logout</Nav.Link>
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