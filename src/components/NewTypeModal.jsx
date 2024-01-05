import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const constants = require('../constants');

function Example({show, setShow, onSaveClick}) {
  const [newName, setNewName] = useState('');

  const handleClose = () => {
    setShow(false);
    setNewName('');
  }
  const handleSave = () => {
    setShow(false);
    setNewName('');
    onSaveClick(newName);
  }
  const onChange = (e) => {
    setNewName(e.target.value);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>Enter the name of the new collection:</Modal.Body>
        <input
            type='text'
            value={newName}
            onChange={onChange}
            placeholder={constants['examples']['type']}
          />
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;