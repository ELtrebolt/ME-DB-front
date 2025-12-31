import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ShareLinkModal from '../components/ShareLinkModal';
const constants = require('../constants');
const theme = require('../theme');

function Profile({ user, setUserChanged }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [sharedLists, setSharedLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [selectedShareData, setSelectedShareData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    setUsername(user.username || user.displayName);
    setEditedUsername(user.username || user.displayName);
    
    // Fetch shared lists
    fetchSharedLists();
  }, [user, navigate]);

  const fetchSharedLists = async () => {
    try {
      const response = await axios.get(`${constants.SERVER_URL}/api/user/shared-lists`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSharedLists(response.data.sharedLists);
      }
    } catch (err) {
      console.error('Error fetching shared lists:', err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!editedUsername || editedUsername.trim() === '') {
      setError('Username cannot be empty');
      return;
    }

    if (editedUsername.trim() === username) {
      setIsEditingUsername(false);
      setError('');
      return;
    }

    try {
      const response = await axios.put(
        `${constants.SERVER_URL}/api/user/username`,
        { username: editedUsername.trim() },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setUsername(editedUsername.trim());
        setIsEditingUsername(false);
        setError('');
        setUserChanged(true); // Trigger user data refresh
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setError(err.response?.data?.error || 'Failed to update username');
    }
  };

  const copyToClipboard = async (token, mediaType) => {
    const url = `${window.location.origin}/shared/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(mediaType);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(mediaType);
        setTimeout(() => setCopyFeedback(null), 2000);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatMediaType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getShareDescription = (config) => {
    if (config.collection && config.todo) return 'Collection & To-Do';
    if (config.collection) return 'Collection';
    if (config.todo) return 'To-Do';
    return '';
  };

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors?.background?.primary || '#1a1a2e',
      color: theme.colors?.text?.primary || '#ffffff',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Profile Header */}
        <div style={{
          backgroundColor: theme.colors?.background?.secondary || '#16213e',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: theme.colors?.text?.primary || '#ffffff'
          }}>Profile</h1>

          {/* Username Section */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: theme.colors?.text?.secondary || '#a0a0a0'
            }}>Username</label>
            
            {!isEditingUsername ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '500',
                  color: theme.colors?.text?.primary || '#ffffff'
                }}>{username}</span>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors?.accent?.primary || '#ffc107',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Edit username"
                >
                  <i className="fas fa-edit" style={{ fontSize: '1rem' }}></i>
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
                      color: theme.colors?.text?.primary || '#ffffff',
                      fontSize: '1rem'
                    }}
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="btn btn-success"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setEditedUsername(username);
                      setError('');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                </div>
                {error && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>{error}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Public Lists Section */}
        <div style={{
          backgroundColor: theme.colors?.background?.secondary || '#16213e',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: theme.colors?.text?.primary || '#ffffff'
          }}>Public Lists</h2>

          {isLoadingLists ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors?.text?.secondary || '#a0a0a0' }}>
              Loading...
            </div>
          ) : sharedLists.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: theme.colors?.text?.secondary || '#a0a0a0'
            }}>
              <p>No public lists yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Share a list from any media page to see it here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sharedLists.map((list) => (
                <div
                  key={list.token}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
                    border: '1px solid #333',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        color: theme.colors?.text?.primary || '#ffffff'
                      }}>
                        {formatMediaType(list.mediaType)}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: theme.colors?.text?.secondary || '#a0a0a0',
                        margin: 0
                      }}>
                        {getShareDescription(list.shareConfig)}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedMediaType(list.mediaType);
                          setSelectedShareData({
                            exists: true,
                            token: list.token,
                            shareConfig: list.shareConfig
                          });
                          setShowShareModal(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem'
                        }}
                        title="Edit share settings"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="d-none d-md-inline">Edit</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(list.token, list.mediaType)}
                        className="btn btn-warning btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <i className={`fas fa-${copyFeedback === list.mediaType ? 'check' : 'copy'}`}></i>
                        {copyFeedback === list.mediaType ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                  <a
                    href={`${window.location.origin}/shared/${list.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.875rem',
                      color: theme.colors?.primary || '#ffc107',
                      fontFamily: 'monospace',
                      backgroundColor: theme.colors?.background?.primary || '#1a1a2e',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      display: 'block',
                      textDecoration: 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      border: `1px solid ${theme.colors?.primary || '#ffc107'}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.colors?.primary || '#ffc107';
                      e.target.style.color = theme.colors?.background?.primary || '#1a1a2e';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors?.background?.primary || '#1a1a2e';
                      e.target.style.color = theme.colors?.primary || '#ffc107';
                    }}
                  >
                    {`${window.location.origin}/shared/${list.token}`}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Share Link Modal */}
      {showShareModal && selectedMediaType && (
        <ShareLinkModal
          show={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedMediaType(null);
            setSelectedShareData(null);
          }}
          mediaType={selectedMediaType}
          toDoState={false}
          initialShareData={selectedShareData}
          onUpdate={() => {
            fetchSharedLists();
          }}
        />
      )}
    </div>
  );
}

export default Profile;

