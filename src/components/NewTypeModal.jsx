import { useState } from 'react';

const constants = require('../constants');

function NewTypeModal({show, setShow, onSaveClick}) {
  const [newName, setNewName] = useState('');

  if (!show) return null;

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
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-strong">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">Add New Type</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p className="mb-3 text-muted">Enter the name of the new collection:</p>
            <input
              type='text'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={constants.examples['type']}
              className="form-control"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTypeModal;