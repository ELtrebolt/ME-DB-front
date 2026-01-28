import React, { useRef, useCallback } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * Base modal component with shared overlay and dialog structure
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {string} dialogClassName - Additional classes for modal-dialog (e.g., 'modal-dialog-centered')
 * @param {string} contentClassName - Additional classes for modal-content (e.g., 'shadow-strong')
 * @param {function} onOverlayClick - Optional callback for overlay click (if not provided, overlay click does nothing)
 * @param {boolean} alignTop - If true, use marginTop: '5vh' style instead of centered
 * @param {React.RefObject} clickOutsideRef - Optional ref for click-outside-to-close functionality
 */
function Modal({
  show,
  onClose,
  title,
  children,
  footer,
  dialogClassName = '',
  contentClassName = 'shadow-strong',
  onOverlayClick,
  alignTop = false,
  clickOutsideRef,
  showCloseButton = true,
  header
}) {
  const internalRef = useRef(null);
  const modalRef = clickOutsideRef || internalRef;

  // Handle click outside - use useCallback to stabilize the callback
  const handleClickOutside = useCallback(() => {
    if (show && clickOutsideRef) {
      onClose();
    }
  }, [show, clickOutsideRef, onClose]);

  useClickOutside(modalRef, handleClickOutside);

  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (onOverlayClick) {
      onOverlayClick(e);
    }
  };

  const dialogStyle = alignTop ? { marginTop: '5vh', marginBottom: 'auto' } : {};

  return (
    <div 
      className="modal fade show d-block" 
      style={{backgroundColor: 'rgba(0,0,0,0.5)'}} 
      tabIndex="-1" 
      onClick={handleOverlayClick}
    >
      <div 
        className={`modal-dialog ${dialogClassName}`}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-content ${contentClassName}`} ref={modalRef}>
          {header ? (
            <div className="modal-header border-bottom">
              {header}
            </div>
          ) : (
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-semibold text-dark">{title}</h5>
              {showCloseButton && (
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose} 
                  aria-label="Close"
                ></button>
              )}
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
          {footer && (
            <div className="modal-footer border-top">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
