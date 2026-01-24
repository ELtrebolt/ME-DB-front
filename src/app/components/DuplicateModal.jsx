import React from 'react';

function DuplicateModal({ show, onDone, onGoToCopy }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" onClick={onDone}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow-strong">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold text-dark">Duplicate Created</h5>
          </div>
          <div className="modal-body">
            <p className="text-dark mb-3">The media item has been successfully duplicated.</p>
            <div className="d-flex gap-2 justify-content-end">
              <button 
                className="btn btn-secondary"
                onClick={onDone}
              >
                Done
              </button>
              <button 
                className="btn btn-success"
                onClick={onGoToCopy}
              >
                Go to Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DuplicateModal;

