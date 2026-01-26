import { useEffect, useRef, useState } from 'react';

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

  // Handle clicking outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show]);

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
      
      {show && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog" style={{
            marginTop: '5vh',
            marginBottom: 'auto'
          }}>
            <div className="modal-content shadow-strong" ref={modalRef}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Delete Confirmation</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="fw-semibold text-dark">{areYouSureText}</p>
              </div>
              <div className="modal-footer border-top">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm d-md-none" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm d-md-none" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >{saveChangesText}</button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg d-none d-md-inline-block" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger btn-lg d-none d-md-inline-block" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >{saveChangesText}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteModal;