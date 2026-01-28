import { useRef, useState } from 'react';
import Modal from './Modal';

function DeleteModal({onDeleteClick, type, onModalOpen, onModalClose, buttonStyle, iconStyle}) {
  const [show, setShow] = useState(false);
  const modalRef = useRef(null);
  const areYouSureText = type === 'media' ? 'Are you sure you want to remove this record?' : 
  `Are you sure you want to delete the entirety of your To-Do List & Collection from ~${type.charAt(0).toUpperCase() + type.slice(1)}~?`;
  const saveChangesText = type === 'media' ? 'Delete' : 'Yes, Delete Everything';

  const handleClose = () => {
    setShow(false);
    if (onModalClose) onModalClose();
  };
  
  const handleOpen = () => {
    setShow(true);
    if (onModalOpen) onModalOpen();
  };
  
  const handleSave = () => { 
    setShow(false); 
    if (onModalClose) onModalClose();
    onDeleteClick(); 
  };

  return (
    <>
      {/* Mobile: icon only */}
      <button 
        className='btn btn-danger btn-sm d-md-none' 
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        title="Delete"
        style={buttonStyle}
      >
        <i className="fas fa-trash" style={iconStyle}></i>
      </button>
      {/* Desktop: full button */}
      <button 
        className='btn btn-danger btn-lg d-none d-md-inline-block' 
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <i className="fas fa-trash me-2"></i>Delete
      </button>
      
      <Modal
        show={show}
        onClose={handleClose}
        title="Delete Confirmation"
        dialogClassName="modal-dialog-centered"
        clickOutsideRef={modalRef}
      >
        <p className="fw-semibold text-dark mb-3">{areYouSureText}</p>
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {saveChangesText}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default DeleteModal;
