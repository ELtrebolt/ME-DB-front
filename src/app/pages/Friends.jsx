import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const constants = require('../constants');
const theme = require('../../styling/theme');

function Friends({ user, setUserChanged }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get(`${constants.SERVER_URL}/api/friends`, { withCredentials: true }),
        axios.get(`${constants.SERVER_URL}/api/friends/requests`, { withCredentials: true })
      ]);

      if (friendsRes.data.success) {
        setFriends(friendsRes.data.friends || []);
      }

      if (requestsRes.data.success) {
        setIncomingRequests(requestsRes.data.incoming || []);
        setOutgoingRequests(requestsRes.data.outgoing || []);
      }
    } catch (err) {
      console.error('Error fetching friends data:', err);
      setError(err.response?.data?.message || 'Failed to load friends data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (username) => {
    try {
      const response = await axios.post(
        `${constants.SERVER_URL}/api/friends/accept/${username}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchFriendsData();
        if (setUserChanged) setUserChanged(true);
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      window.alert(err.response?.data?.message || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (username) => {
    try {
      const response = await axios.post(
        `${constants.SERVER_URL}/api/friends/reject/${username}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchFriendsData();
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      window.alert(err.response?.data?.message || 'Failed to reject friend request');
    }
  };

  const handleUnfriend = async (username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} as a friend?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${constants.SERVER_URL}/api/friends/${username}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchFriendsData();
        if (setUserChanged) setUserChanged(true);
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      window.alert(err.response?.data?.message || 'Failed to remove friend');
    }
  };

  const FriendCard = ({ friend, showUnfriend = false }) => (
    <div style={{
      backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      transition: 'border-color 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {friend.profilePic ? (
          <img
            src={friend.profilePic}
            alt={friend.displayName}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: theme.colors?.primary || '#ffc107',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors?.background?.primary || '#1a1a2e',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            {friend.displayName?.charAt(0).toUpperCase() || friend.username?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <div>
          <a
            href={`/user/${friend.username}`}
            style={{
              color: theme.colors?.text?.primary || '#ffffff',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'block',
              marginBottom: '0.25rem'
            }}
            onMouseEnter={(e) => e.target.style.color = theme.colors?.primary || '#ffc107'}
            onMouseLeave={(e) => e.target.style.color = theme.colors?.text?.primary || '#ffffff'}
          >
            {friend.displayName || friend.username}
          </a>
          <span style={{
            color: theme.colors?.text?.secondary || '#a0a0a0',
            fontSize: '0.875rem'
          }}>
            @{friend.username}
          </span>
        </div>
      </div>
      {showUnfriend && (
        <button
          onClick={() => handleUnfriend(friend.username)}
          className="btn btn-danger btn-sm"
          style={{ flexShrink: 0 }}
        >
          Unfriend
        </button>
      )}
    </div>
  );

  const RequestCard = ({ request, type }) => (
    <div style={{
      backgroundColor: theme.colors?.background?.tertiary || '#0f1419',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {type === 'incoming' ? (
          <>
            {request.from.profilePic ? (
              <img
                src={request.from.profilePic}
                alt={request.from.displayName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: theme.colors?.primary || '#ffc107',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors?.background?.primary || '#1a1a2e',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {request.from.displayName?.charAt(0).toUpperCase() || request.from.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <a
                href={`/user/${request.from.username}`}
                style={{
                  color: theme.colors?.text?.primary || '#ffffff',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => e.target.style.color = theme.colors?.primary || '#ffc107'}
                onMouseLeave={(e) => e.target.style.color = theme.colors?.text?.primary || '#ffffff'}
              >
                {request.from.displayName || request.from.username}
              </a>
              <span style={{
                color: theme.colors?.text?.secondary || '#a0a0a0',
                fontSize: '0.875rem'
              }}>
                @{request.from.username}
              </span>
            </div>
          </>
        ) : (
          <>
            {request.to.profilePic ? (
              <img
                src={request.to.profilePic}
                alt={request.to.displayName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: theme.colors?.primary || '#ffc107',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors?.background?.primary || '#1a1a2e',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {request.to.displayName?.charAt(0).toUpperCase() || request.to.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <a
                href={`/user/${request.to.username}`}
                style={{
                  color: theme.colors?.text?.primary || '#ffffff',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => e.target.style.color = theme.colors?.primary || '#ffc107'}
                onMouseLeave={(e) => e.target.style.color = theme.colors?.text?.primary || '#ffffff'}
              >
                {request.to.displayName || request.to.username}
              </a>
              <span style={{
                color: theme.colors?.text?.secondary || '#a0a0a0',
                fontSize: '0.875rem'
              }}>
                @{request.to.username} • Pending
              </span>
            </div>
          </>
        )}
      </div>
      {type === 'incoming' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => handleAcceptRequest(request.from.username)}
            className="btn btn-success btn-sm"
          >
            Accept
          </button>
          <button
            onClick={() => handleRejectRequest(request.from.username)}
            className="btn btn-danger btn-sm"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: theme.colors?.status?.danger || '#dc3545', marginBottom: '1rem' }}>{error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors?.background?.primary || '#1a1a2e',
      color: theme.colors?.text?.primary || '#ffffff',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          marginBottom: '2rem',
          color: theme.colors?.text?.primary || '#ffffff'
        }}>
          Friends
        </h1>

        {/* Incoming Friend Requests */}
        {incomingRequests.length > 0 && (
          <div style={{
            backgroundColor: theme.colors?.background?.secondary || '#16213e',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.colors?.text?.primary || '#ffffff'
            }}>
              Friend Requests
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incomingRequests.map((request, index) => (
                <RequestCard key={index} request={request} type="incoming" />
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div style={{
          backgroundColor: theme.colors?.background?.secondary || '#16213e',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: theme.colors?.text?.primary || '#ffffff'
          }}>
            Your Friends ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: theme.colors?.text?.secondary || '#a0a0a0'
            }}>
              <p>You don't have any friends yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Visit someone's profile and send them a friend request!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {friends.map((friend) => (
                <FriendCard key={friend.ID} friend={friend} showUnfriend={true} />
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Friend Requests */}
        {outgoingRequests.length > 0 && (
          <div style={{
            backgroundColor: theme.colors?.background?.secondary || '#16213e',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.colors?.text?.primary || '#ffffff'
            }}>
              Pending Requests ({outgoingRequests.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {outgoingRequests.map((request, index) => (
                <RequestCard key={index} request={request} type="outgoing" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {friends.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
          <div style={{
            backgroundColor: theme.colors?.background?.secondary || '#16213e',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              fontSize: '1.125rem',
              color: theme.colors?.text?.secondary || '#a0a0a0',
              marginBottom: '1rem'
            }}>
              No friends or friend requests yet.
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: theme.colors?.text?.secondary || '#a0a0a0'
            }}>
              Visit someone's profile and send them a friend request to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
