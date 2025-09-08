import React, { useState, useEffect, useRef } from 'react';
import NewTypeModal from "../components/NewTypeModal";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const constants = require('../constants');

const NavbarFunction = ({user, setUserChanged, newTypes}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [navNewTypes, setNavNewTypes] = useState(newTypes);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const mediaDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const showNewTypeModal = () => setShowModal(true);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mediaDropdownRef.current && !mediaDropdownRef.current.contains(event.target)) {
        setIsMediaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onCreateNewType = (newName) => {
    newName = newName.trim().toLowerCase().replace(/ /g, '-');
    if(user.newTypes[newName]) {
      window.alert('Type Already Exists');
    } else if(Object.keys(user.newTypes).length === constants.maxCustomTypes) {
      window.alert(`Maximum custom types reached (${constants.maxCustomTypes})`);
    } else {
      axios
        .put(constants['SERVER_URL'] + `/api/user/newTypes`, {newType: newName})
        .then((res) => {
          setNavNewTypes(Object.keys(res.data.newTypes));
          setUserChanged(true);
          navigate(`/${newName}/collection`);
        })
        .catch(() => window.alert("Error on Create New Type"));
    }
  };

  const exportAllData = async () => {
    try {
      const response = await axios.get(`${constants.SERVER_URL}/api/media/export`, { withCredentials: true });
      if (response.data.success) {
        const csvContent = response.data.csv;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `me-db-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.alert('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      window.alert('Error exporting data');
    }
  };

  const switchGoogleAccount = () => {
    window.location.href = `${constants.SERVER_URL}/auth/google?prompt=select_account`;
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href={user ? "/anime/collection" : "/"} style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              textDecoration: 'none'
            }}>
              ME-DB
            </a>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              {/* Left side navigation items */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <a href="/about" style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }} onMouseEnter={(e) => e.target.style.color = '#374151'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                  About
                </a>
                <a href="/stats" style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }} onMouseEnter={(e) => e.target.style.color = '#374151'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                  Stats
                </a>
                
                {/* Media Dropdown */}
                <div style={{ position: 'relative' }} ref={mediaDropdownRef}>
                  <button
                    style={{
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '1rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#374151'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
                  >
                    Media
                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isMediaMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '100%',
                      marginTop: '0.5rem',
                      width: '160px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      zIndex: 50,
                      padding: '0.125rem 0'
                    }}>
                      <a href="/anime/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                        Anime
                      </a>
                      <a href="/tv/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                        TV Shows
                      </a>
                      <a href="/movies/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                        Movies
                      </a>
                      <a href="/games/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                        Games
                      </a>
                      {navNewTypes.length > 0 && <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />}
                      {navNewTypes.length > 0 && navNewTypes.map((item, index) => (
                        <a key={index} href={`/${item}/collection`} style={{
                          display: 'block',
                          padding: '0.25rem 1rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                          textDecoration: 'none'
                        }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                      ))}
                      <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} onClick={showNewTypeModal}>
                        Add New
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side items */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {/* User Profile Dropdown */}
                <div style={{ position: 'relative' }} ref={userDropdownRef}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#374151'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <img
                      src={user.profilePic}
                      alt=""
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      maxWidth: '128px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{user.displayName}</span>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '0.5rem',
                      width: '192px',
                      backgroundColor: '#ffffff',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      zIndex: 50,
                      padding: '0.25rem 0'
                    }}>
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} onClick={exportAllData}>
                Export All Data
                      </button>
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} onClick={switchGoogleAccount}>
                Switch Google Account
                      </button>
                      <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                      <a href="/logout" style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                Logout
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {user ? (
        <NewTypeModal show={showModal} setShow={setShowModal} onSaveClick={onCreateNewType} />
      ) : null}
    </nav>
  );
}

export default NavbarFunction