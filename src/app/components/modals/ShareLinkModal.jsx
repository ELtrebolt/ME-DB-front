import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toCapitalNotation } from '../../helpers';
import Modal from './Modal';
const constants = require('../../constants');

function ShareLinkModal({ 
  show, 
  onClose, 
  mediaType, 
  toDoState = false,
  onUpdate,
  initialShareData = null,
  username = ''
}) {
  // Initialize state based on initialShareData if provided, otherwise use defaults
  const [shareConfig, setShareConfig] = useState(() => {
    if (initialShareData && initialShareData.exists) {
      return initialShareData.shareConfig;
    }
    return { collection: !toDoState, todo: toDoState };
  });
  const [shareToken, setShareToken] = useState(() => {
    if (initialShareData && initialShareData.exists) {
      return initialShareData.token;
    }
    return null;
  });
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update state when initialShareData changes or modal opens
  useEffect(() => {
    if (show && mediaType) {
      if (initialShareData && initialShareData.exists) {
        // Use provided share data immediately
        setShareToken(initialShareData.token);
        setShareConfig(initialShareData.shareConfig);
      } else if (!initialShareData) {
        // Check for existing share link via API only if initialShareData is not provided
        axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`)
          .then(res => {
            if (res.data.exists) {
              setShareToken(res.data.token);
              setShareConfig(res.data.shareConfig);
            } else {
              setShareToken(null);
              // Default config based on current view (To-Do or Collection)
              setShareConfig({ collection: !toDoState, todo: toDoState });
            }
          })
          .catch(err => console.error('Error checking share status:', err));
      }
    }
  }, [show, mediaType, toDoState, initialShareData]);

  function generateShareLink() {
    setIsGeneratingLink(true);
    axios.post(constants['SERVER_URL'] + '/api/share', {
      mediaType,
      shareConfig
    })
    .then(res => {
      setShareToken(res.data.token);
      setIsGeneratingLink(false);
      if (onUpdate) {
        onUpdate();
      }
    })
    .catch(err => {
      console.error(err);
      setIsGeneratingLink(false);
      window.alert('Error generating link');
    });
  }

  function revokeShareLink() {
      if(!window.confirm("Are you sure? This will disable the current link immediately.")) return;
      
      axios.delete(constants['SERVER_URL'] + `/api/share/${mediaType}`)
      .then(res => {
          setShareToken(null);
          // Default config based on current view (To-Do or Collection)
          setShareConfig({ collection: !toDoState, todo: toDoState });
          if (onUpdate) {
            onUpdate();
          }
      })
      .catch(err => {
          console.error(err);
          window.alert('Error revoking link');
      });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`Share ${toCapitalNotation(mediaType)} List`}
      dialogClassName="modal-dialog-centered"
      onOverlayClick={onClose}
    >
      {!shareToken ? (
              <>
                <p className="text-dark">Select what you want to share via a public link:</p>
                <div className="form-check mb-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="shareCollection" 
                    checked={shareConfig.collection} 
                    onChange={(e) => setShareConfig({...shareConfig, collection: e.target.checked})}
                  />
                  <label className="form-check-label text-dark" htmlFor="shareCollection">
                    Collection
                  </label>
                </div>
                <div className="form-check mb-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="shareTodo" 
                    checked={shareConfig.todo} 
                    onChange={(e) => setShareConfig({...shareConfig, todo: e.target.checked})}
                  />
                  <label className="form-check-label text-dark" htmlFor="shareTodo">
                    To-Do List
                  </label>
                </div>
                
                <div className="d-grid">
                  <button 
                    className="btn btn-primary" 
                    onClick={generateShareLink}
                    disabled={((!shareConfig.collection && !shareConfig.todo)) || isGeneratingLink}
                  >
                    {isGeneratingLink ? 'Generating...' : 'Generate Public Link'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-success mb-2"><i className="fas fa-check-circle fa-2x"></i></p>
                <p className="fw-bold text-dark mb-3">Link Active</p>
                
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={`${window.location.origin}/user/${username}/${mediaType}`} 
                    readOnly 
                  />
                  <button 
                    className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/user/${username}/${mediaType}`)}
                  >
                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                </div>
                <p className="small text-muted mb-3">
                  Anyone with this link can view the selected lists.
                </p>

                <hr />
                
                <div className="text-start mb-3">
                    <p className="text-dark fw-semibold mb-2">Update Settings:</p>
                    <div className="form-check mb-2">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="shareCollectionEdit" 
                            checked={shareConfig.collection} 
                            onChange={(e) => setShareConfig({...shareConfig, collection: e.target.checked})}
                        />
                        <label className="form-check-label text-dark" htmlFor="shareCollectionEdit">Collection</label>
                    </div>
                    <div className="form-check mb-3">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="shareTodoEdit" 
                            checked={shareConfig.todo} 
                            onChange={(e) => setShareConfig({...shareConfig, todo: e.target.checked})}
                        />
                        <label className="form-check-label text-dark" htmlFor="shareTodoEdit">To-Do List</label>
                    </div>
                    <button 
                        className="btn btn-outline-primary w-100 mb-3"
                        onClick={generateShareLink}
                        disabled={((!shareConfig.collection && !shareConfig.todo)) || isGeneratingLink}
                    >
                        Update Permissions
                    </button>
                </div>

                <button 
                    className="btn btn-outline-danger w-100"
                    onClick={revokeShareLink}
                >
                    Unshare / Revoke Link
                </button>
              </div>
            )}
    </Modal>
  );
}

export default ShareLinkModal;
