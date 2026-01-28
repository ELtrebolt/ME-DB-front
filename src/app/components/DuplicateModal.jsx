import React from 'react';
import Modal from './ui/Modal';

function DuplicateModal({ show, onDone, onGoToCopy }) {
  return (
    <Modal
      show={show}
      onClose={onDone}
      title="Duplicate Created"
      dialogClassName="modal-dialog-centered"
      onOverlayClick={onDone}
    >
      <p className="text-dark mb-3">The media item has been successfully duplicated.</p>
      <div className="d-flex gap-2 justify-content-end">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onDone}
        >
          Done
        </button>
        <button 
          className="btn btn-success btn-sm"
          onClick={onGoToCopy}
        >
          Go to Copy
        </button>
      </div>
    </Modal>
  );
}

export default DuplicateModal;

