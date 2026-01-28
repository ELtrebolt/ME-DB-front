import { useState, useEffect } from 'react';
import Modal from './Modal';

const MAX_DESCRIPTION_LENGTH = 100;

function EditListModal({ show, setShow, onSave, currentDescription, isHomePage = false, showHomePageOption = true }) {
  const [description, setDescription] = useState(currentDescription || '');
  const [setAsHome, setSetAsHome] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setDescription(currentDescription || '');
      setSetAsHome(isHomePage);
    }
  }, [show, currentDescription, isHomePage]);

  const handleClose = () => {
    setShow(false);
    setDescription(currentDescription || '');
    setSetAsHome(isHomePage);
  };

  const handleSave = () => {
    onSave({ description, setAsHome });
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="Edit List"
      dialogClassName="modal-dialog-centered"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label htmlFor="listDescription" className="form-label mb-0">Description</label>
          <small className={description.length >= MAX_DESCRIPTION_LENGTH ? 'text-danger' : 'text-muted'}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </small>
        </div>
        <textarea
          id="listDescription"
          className="form-control"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="Enter a description for this list..."
        />
      </div>
      {showHomePageOption && (
        <div 
          className="d-flex align-items-center" 
          style={{ cursor: 'pointer' }}
          onClick={() => setSetAsHome(!setAsHome)}
        >
          <i 
            className={`${setAsHome ? 'fas fa-check-square' : 'far fa-square'} me-2`}
            style={{ 
              fontSize: '1.25rem', 
              color: setAsHome ? '#28a745' : '#6c757d'
            }}
          ></i>
          <div>
            <span style={{ fontSize: '0.95rem' }}>
              Set as Home Page
            </span>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
              This list will open first when you log in
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default EditListModal;
