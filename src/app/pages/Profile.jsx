import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ShareLinkModal from '../components/ShareLinkModal';
const constants = require('../constants');
const theme = require('../../styling/theme');

function Profile({ user: currentUser, setUserChanged }) {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams();
  
  const [user, setUser] = useState(currentUser || null);
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
  const [isPublicView, setIsPublicView] = useState(!!urlUsername);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [profileCopyFeedback, setProfileCopyFeedback] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [isUpdatingFriendship, setIsUpdatingFriendship] = useState(false);

  useEffect(() => {
    if (urlUsername) {
      setIsPublicView(true);
      fetchPublicProfile(urlUsername);
    } else if (currentUser) {
      setIsPublicView(false);
      setUser(currentUser);
      setUsername(currentUser.username || currentUser.displayName);
      setEditedUsername(currentUser.username || currentUser.displayName);
      fetchSharedLists();
    } else {
      navigate('/');
    }
  }, [currentUser, urlUsername, navigate]);

  const fetchPublicProfile = async (uname) => {
    setIsLoadingLists(true);
    try {
      const response = await axios.get(`${constants.SERVER_URL}/api/user/public/${uname}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUser(response.data.user);
        setUsername(response.data.user.username);
        setSharedLists(response.data.sharedLists);
        setFriendshipStatus(response.data.friendshipStatus || 'none');
        setError('');
      }
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError(err.response?.data?.message || 'Profile not found or private');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const toggleVisibility = async (e) => {
    const newVal = e.target.checked;
    setIsUpdatingVisibility(true);
    try {
      const response = await axios.put(`${constants.SERVER_URL}/api/user/visibility`, {
        isPublicProfile: newVal
      });
      if (response.data.success) {
        setUser({ ...user, isPublicProfile: response.data.isPublicProfile });
        if (setUserChanged) setUserChanged(true);
      }
    } catch (err) {
      console.error('Error updating visibility:', err);
      window.alert('Failed to update visibility');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const copyProfileLink = async () => {
    const url = `${window.location.origin}/user/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setProfileCopyFeedback(true);
      setTimeout(() => setProfileCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy profile link:', err);
    }
  };

  const handleFriendAction = async (action) => {
    if (!username) return;
    
    setIsUpdatingFriendship(true);
    try {
      let response;
      if (action === 'send') {
        response = await axios.post(
          `${constants.SERVER_URL}/api/friends/request/${username}`,
          {},
          { withCredentials: true }
        );
        if (response.data.success) {
          setFriendshipStatus('request_sent');
        }
      } else if (action === 'accept') {
        response = await axios.post(
          `${constants.SERVER_URL}/api/friends/accept/${username}`,
          {},
          { withCredentials: true }
        );
        if (response.data.success) {
          setFriendshipStatus('friends');
          if (setUserChanged) setUserChanged(true);
        }
      } else if (action === 'reject') {
        response = await axios.post(
          `${constants.SERVER_URL}/api/friends/reject/${username}`,
          {},
          { withCredentials: true }
        );
        if (response.data.success) {
          setFriendshipStatus('none');
        }
      } else if (action === 'unfriend') {
        if (!window.confirm(`Are you sure you want to remove ${username} as a friend?`)) {
          setIsUpdatingFriendship(false);
          return;
        }
        response = await axios.delete(
          `${constants.SERVER_URL}/api/friends/${username}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setFriendshipStatus('none');
          if (setUserChanged) setUserChanged(true);
        }
      }

      if (response && !response.data.success) {
        window.alert(response.data.message || 'Action failed');
      }
    } catch (err) {
      console.error(`Error ${action}ing friend:`, err);
      window.alert(err.response?.data?.message || `Failed to ${action} friend`);
    } finally {
      setIsUpdatingFriendship(false);
    }
  };

  const renderFriendButton = () => {
    // Don't show friend button if not viewing public profile, if it's self, or if no user is logged in
    if (!isPublicView || friendshipStatus === 'self' || !currentUser) {
      return null;
    }

    if (friendshipStatus === 'none') {
      return (
        <button
          onClick={() => handleFriendAction('send')}
          disabled={isUpdatingFriendship}
          className="btn btn-primary"
          style={{ marginLeft: '1rem' }}
        >
          {isUpdatingFriendship ? 'Sending...' : 'Add Friend'}
        </button>
      );
    }

    if (friendshipStatus === 'request_sent') {
      return (
        <button
          disabled
          className="btn btn-secondary"
          style={{ marginLeft: '1rem', cursor: 'not-allowed' }}
        >
          Friend Request Sent
        </button>
      );
    }

    if (friendshipStatus === 'request_received') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
          <button
            onClick={() => handleFriendAction('accept')}
            disabled={isUpdatingFriendship}
            className="btn btn-success"
          >
            {isUpdatingFriendship ? 'Accepting...' : 'Accept Friend Request'}
          </button>
          <button
            onClick={() => handleFriendAction('reject')}
            disabled={isUpdatingFriendship}
            className="btn btn-danger"
          >
            Reject
          </button>
        </div>
      );
    }

    if (friendshipStatus === 'friends') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center' }}>
          <span style={{ color: theme.colors?.status?.success || '#28a745', fontSize: '0.875rem' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '0.25rem' }}></i>
            Friends
          </span>
          <button
            onClick={() => handleFriendAction('unfriend')}
            disabled={isUpdatingFriendship}
            className="btn btn-danger btn-sm"
          >
            {isUpdatingFriendship ? 'Removing...' : 'Unfriend'}
          </button>
        </div>
      );
    }

    return null;
  };

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
    const trimmedUsername = editedUsername.trim();
    
    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }

    if (trimmedUsername.length > 30) {
      setError('Username must be 30 characters or less');
      return;
    }

    // Standard username validation: alphanumeric and underscores only, must start with letter or number
    const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores, and must start with a letter or number');
      return;
    }

    if (trimmedUsername === username) {
      setIsEditingUsername(false);
      setError('');
      return;
    }

    try {
      const response = await axios.put(
        `${constants.SERVER_URL}/api/user/username`,
        { username: trimmedUsername },
        { withCredentials: true }
      );

      if (response.data.msg) {
        setUsername(trimmedUsername);
        setIsEditingUsername(false);
        setError('');
        setUserChanged(true); // Trigger user data refresh
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setError(err.response?.data?.error || 'Failed to update username');
    }
  };

  const copyToClipboard = async (mediaType) => {
    const url = `${window.location.origin}/user/${username}/${mediaType}`;
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

  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Require 15px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = sharedLists.findIndex(list => list.mediaType === active.id);
    const newIndex = sharedLists.findIndex(list => list.mediaType === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Store previous state for potential revert
    const previousOrder = [...sharedLists];
    const newOrder = arrayMove(sharedLists, oldIndex, newIndex);
    setSharedLists(newOrder);

    // Save order to backend
    try {
      await axios.put(
        `${constants.SERVER_URL}/api/user/shared-lists-order`,
        { order: newOrder.map(list => list.mediaType) },
        { withCredentials: true }
      );
    } catch (err) {
      console.error('Error updating shared lists order:', err);
      // Revert on error
      setSharedLists(previousOrder);
    }
  };

  // Sortable Shared List Component
  function SortableSharedList({ list }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: list.mediaType, disabled: isPublicView });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: isPublicView ? 'default' : 'grab'
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(!isPublicView ? listeners : {})}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
            border: '1px solid #333',
            transition: 'border-color 0.2s',
            height: '100%'
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
              {!isPublicView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMediaType(list.mediaType);
                    setSelectedShareData({
                      exists: true,
                      token: list.token,
                      shareConfig: list.shareConfig
                    });
                    setShowShareModal(true);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
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
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(list.mediaType);
                }}
                onPointerDown={(e) => e.stopPropagation()}
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
            href={`${window.location.origin}/user/${username}/${list.mediaType}`}
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
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
            {`${window.location.origin}/user/${username}/${list.mediaType}`}
          </a>
        </div>
      </div>
    );
  }

  if (error && isPublicView) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors?.background?.primary || '#1a1a2e',
        color: theme.colors?.text?.primary || '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="text-center">
          <h2 className="text-danger mb-3">{error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (!user && !isLoadingLists) return null;

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600', margin: 0 }}>Profile</h1>
            {renderFriendButton()}
          </div>

          {/* Username Section */}
          <div style={{ marginBottom: '1.5rem' }}>
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
                {!isPublicView && (
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
                )}
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
                    size={Math.max(editedUsername.length, 10)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
                      color: theme.colors?.text?.primary || '#ffffff',
                      fontSize: '1rem',
                      width: 'auto'
                    }}
                    maxLength={30}
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

          {/* Visibility Toggle */}
          {!isPublicView && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: theme.colors?.text?.secondary || '#a0a0a0'
              }}>Profile Visibility</label>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="visibilityToggle" 
                  checked={user?.isPublicProfile || false}
                  onChange={toggleVisibility}
                  disabled={isUpdatingVisibility}
                  style={{ 
                    cursor: 'pointer',
                    width: '3rem',
                    height: '1.5rem',
                    fontSize: '1.5rem',
                    margin: 0
                  }}
                />
                <label htmlFor="visibilityToggle" style={{ 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  color: theme.colors?.text?.primary || '#ffffff',
                  margin: 0,
                  cursor: 'pointer'
                }}>
                  {user?.isPublicProfile ? 'Public' : 'Private'}
                </label>
                
                {/* Public Link Section (only if public) */}
                {user?.isPublicProfile && (
                  <div style={{ 
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: `1px solid ${theme.colors?.primary || '#ffc107'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: 'fit-content'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: theme.colors?.primary, whiteSpace: 'nowrap' }}>Your profile is public at:</span>
                    <a 
                      href={`${window.location.origin}/user/${username}`}
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${theme.colors?.primary || '#ffc107'}`,
                        color: theme.colors?.primary || '#ffc107',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme.colors?.primary || '#ffc107';
                        e.target.style.color = theme.colors?.background?.primary || '#1a1a2e';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.2)';
                        e.target.style.color = theme.colors?.primary || '#ffc107';
                      }}
                    >
                      {`${window.location.origin}/user/${username}`}
                    </a>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={copyProfileLink}
                      title="Copy profile link"
                      style={{ flexShrink: 0 }}
                    >
                      <i className={`fas fa-${profileCopyFeedback ? 'check' : 'copy'}`}></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Lists Section */}
        <div style={{
          backgroundColor: theme.colors?.background?.secondary || '#16213e',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          opacity: (!isPublicView && !user?.isPublicProfile) ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
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
              {!isPublicView && (
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Share a list from any media page to see it here.
              </p>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sharedLists.map(list => list.mediaType)}
                strategy={rectSortingStrategy}
                >
                  <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  {sharedLists.map((list) => (
                    <SortableSharedList key={list.mediaType} list={list} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      
      {/* Share Link Modal */}
      {!isPublicView && showShareModal && selectedMediaType && (
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
          username={username}
          onUpdate={() => {
            fetchSharedLists();
          }}
        />
      )}
    </div>
  );
}

export default Profile;

