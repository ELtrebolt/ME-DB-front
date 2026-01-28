import { useState } from 'react';
import Modal from './ui/Modal';

const constants = require('../constants');

function NewTypeModal({show, setShow, onSaveClick}) {
  const [newName, setNewName] = useState('');

  const handleClose = () => {
    setShow(false);
    setNewName('');
  };

  const handleSave = () => {
    setShow(false);
    onSaveClick(newName);
    setNewName('');
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="Add New Type"
      dialogClassName="modal-dialog-centered"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </>
      }
    >
      <p className="mb-3 text-muted">Enter the name of the new collection:</p>
      <input
        type='text'
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder={constants.examples['type']}
        className="form-control"
      />
    </Modal>
  );
}

export default NewTypeModal;