import { useEffect, useRef, useState } from 'react';

function DeleteModal({onDeleteClick, type}) {
  const [show, setShow] = useState(false);
  const modalRef = useRef(null);
  const areYouSureText = type === 'media' ? 'Are you sure you want to remove this record?' : 
  `Are you sure you want to delete the entirety of your To-Do List & Collection from ~${type.charAt(0).toUpperCase() + type.slice(1)}~?`;
  const saveChangesText = type === 'media' ? 'Delete' : 'Yes, Delete Everything';

  const handleClose = () => setShow(false);
  const handleSave = () => { setShow(false); onDeleteClick(); };

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
      <div className="text-end">
        <button 
          className='btn btn-danger btn-lg' 
          onClick={() => setShow(true)}
        >
          Delete
        </button>
      </div>
      
      {show && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-strong" ref={modalRef}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Delete Confirmation</h5>
                <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="fw-semibold text-dark">{areYouSureText}</p>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-lg" onClick={handleClose}>Cancel</button>
                <button type="button" className="btn btn-danger btn-lg" onClick={handleSave}>{saveChangesText}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteModal;