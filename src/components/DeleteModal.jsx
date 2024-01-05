import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Example({onDeleteClick, type}) {
  const [show, setShow] = useState(false);
  const areYouSureText = type === 'media' ? 'Are you sure you want to remove this record?' : 
  `Are you sure you want to delete the entirety of your To-Do List & Collection from ~${type.charAt(0).toUpperCase() + type.slice(1)}~?`
  const saveChangesText = type === 'media' ? 'Delete' : 'Yes, Delete Everything'

  const handleClose = () => {
    setShow(false);
  }
  const handleSave = () => {
    setShow(false);
    onDeleteClick();
  }
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Delete
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body><b>{areYouSureText}</b></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSave}>
            {saveChangesText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;