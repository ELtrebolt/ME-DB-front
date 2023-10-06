import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Example({onDeleteClick}) {
  const [show, setShow] = useState(false);

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
      {/* <button
        type='button'
        className='btn btn-outline-danger btn-lg btn-block'
        data-bs-toggle="modal" data-bs-target="#exampleModal"
      >
        Delete
      </button> */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this media?</Modal.Body>
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