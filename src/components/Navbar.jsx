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

  // Calculate dynamic width for mobile profile dropdown
  const calculateProfileDropdownWidth = () => {
    const labels = ['Export All Data', 'Switch Account', 'Logout'];
    const longestLabel = labels.reduce((a, b) => a.length > b.length ? a : b);
    
    // More conservative estimate: character count * smaller character width + padding
    // Using 0.75rem font size, roughly 6px per character + 24px padding (0.75rem * 2)
    const estimatedWidth = longestLabel.length * 6 + 24;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 100);
  };

  // Calculate dynamic width for mobile media dropdown
  const calculateMediaDropdownWidth = () => {
    const staticLabels = ['Anime', 'TV Shows', 'Movies', 'Games', 'Add New'];
    const customLabels = navNewTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1));
    const allLabels = [...staticLabels, ...customLabels];
    const longestLabel = allLabels.reduce((a, b) => a.length > b.length ? a : b);
    
    // More conservative estimate: character count * smaller character width + padding
    // Using 0.75rem font size, roughly 6px per character + 24px padding (0.75rem * 2)
    const estimatedWidth = longestLabel.length * 6 + 24;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 80);
  };

  // Calculate dynamic width for desktop media dropdown
  const calculateDesktopMediaDropdownWidth = () => {
    const staticLabels = ['Anime', 'TV Shows', 'Movies', 'Games', 'Add New'];
    const customLabels = navNewTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1));
    const allLabels = [...staticLabels, ...customLabels];
    const longestLabel = allLabels.reduce((a, b) => a.length > b.length ? a : b);
    
    // Desktop uses 0.875rem font size, roughly 7px per character + 32px padding (1rem * 2)
    const estimatedWidth = longestLabel.length * 7 + 32;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 100);
  };

  // Calculate dynamic width for desktop profile dropdown
  const calculateDesktopProfileDropdownWidth = () => {
    const labels = ['Export All Data', 'Switch Google Account', 'Logout'];
    const longestLabel = labels.reduce((a, b) => a.length > b.length ? a : b);
    
    // Desktop uses 0.875rem font size, roughly 7px per character + 32px padding (1rem * 2)
    const estimatedWidth = longestLabel.length * 7 + 32;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 120);
  };

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

  // Set CSS custom properties for dynamic dropdown widths
  useEffect(() => {
    const profileDropdownWidth = calculateProfileDropdownWidth();
    const mediaDropdownWidth = calculateMediaDropdownWidth();
    const desktopProfileDropdownWidth = calculateDesktopProfileDropdownWidth();
    const desktopMediaDropdownWidth = calculateDesktopMediaDropdownWidth();
    
    document.documentElement.style.setProperty('--mobile-profile-dropdown-width', `${profileDropdownWidth}px`);
    document.documentElement.style.setProperty('--mobile-media-dropdown-width', `${mediaDropdownWidth}px`);
    document.documentElement.style.setProperty('--desktop-profile-dropdown-width', `${desktopProfileDropdownWidth}px`);
    document.documentElement.style.setProperty('--desktop-media-dropdown-width', `${desktopMediaDropdownWidth}px`);
  }, [navNewTypes, calculateMediaDropdownWidth, calculateDesktopMediaDropdownWidth]);

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
          height: window.innerWidth < 768 ? '48px' : '64px'
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href={user ? "/anime/collection" : "/"} style={{
              fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              textDecoration: 'none'
            }}>
              ME-DB
            </a>
          </div>

          {/* Mobile Navigation */}
          {user && window.innerWidth < 768 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {/* Mobile About and Stats Links */}
              <a href="/about" style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                padding: '0.5rem 0.5rem',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => e.target.style.color = '#374151'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                About
              </a>
              <a href="/stats" style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                padding: '0.5rem 0.5rem',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => e.target.style.color = '#374151'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                Stats
              </a>
              
              {/* Mobile Media Dropdown */}
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
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    padding: '0.5rem 0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#374151'}
                  onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                  onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
                >
                  Media
                  <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMediaMenuOpen && (
                  <div className="mobile-media-dropdown" style={{
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    width: `${calculateMediaDropdownWidth()}px`,
                    minWidth: `${calculateMediaDropdownWidth()}px`,
                    backgroundColor: '#ffffff',
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    zIndex: 50,
                    padding: '0.125rem 0'
                  }}>
                      <a href="/anime/collection" className="navbar-dropdown-item" style={{
                        display: 'block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }}>
                        Anime
                      </a>
                    <a href="/tv/collection" style={{
                      display: 'block',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      TV Shows
                    </a>
                    <a href="/movies/collection" style={{
                      display: 'block',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Movies
                    </a>
                    <a href="/games/collection" style={{
                      display: 'block',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Games
                    </a>
                    {navNewTypes.length > 0 && <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />}
                    {navNewTypes.length > 0 && navNewTypes.map((item, index) => (
                      <a key={index} href={`/${item}/collection`} style={{
                        display: 'block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </a>
                    ))}
                    <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={showNewTypeModal}>
                      Add New
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile User Profile */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    padding: '0.5rem 0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#374151'}
                  onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      backgroundColor: '#e5e7eb',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.log('Profile picture failed to load:', user.profilePic);
                      // Show a fallback instead of hiding
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNlNWU3ZWIiLz4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOUgxN0MxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+';
                    }}
                    onLoad={() => {
                      console.log('Profile picture loaded successfully:', user.profilePic);
                    }}
                  />
                  <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="mobile-profile-dropdown" style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    width: `${calculateProfileDropdownWidth()}px`,
                    minWidth: `${calculateProfileDropdownWidth()}px`,
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
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={exportAllData}>
                      Export All Data
                    </button>
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={switchGoogleAccount}>
                      Switch Account
                    </button>
                    <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />
                    <a href="/logout" style={{
                      display: 'block',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          {user && window.innerWidth >= 768 && (
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
                    <div className="desktop-media-dropdown" style={{
                      position: 'absolute',
                      left: 0,
                      top: '100%',
                      marginTop: '0.5rem',
                      width: `${calculateDesktopMediaDropdownWidth()}px`,
                      minWidth: `${calculateDesktopMediaDropdownWidth()}px`,
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
                      }} className="navbar-dropdown-item">
                        Anime
                      </a>
                      <a href="/tv/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        TV Shows
                      </a>
                      <a href="/movies/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Movies
                      </a>
                      <a href="/games/collection" style={{
                        display: 'block',
                        padding: '0.25rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Games
                      </a>
                      {navNewTypes.length > 0 && <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />}
                      {navNewTypes.length > 0 && navNewTypes.map((item, index) => (
                        <a key={index} href={`/${item}/collection`} style={{
                          display: 'block',
                          padding: '0.25rem 1rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                          textDecoration: 'none'
                        }} className="navbar-dropdown-item">
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                      ))}
                      <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />
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
                      }} className="navbar-dropdown-item" onClick={showNewTypeModal}>
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
                      alt="Profile"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        console.log('Profile picture failed to load:', user.profilePic);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully:', user.profilePic);
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
                    <div className="desktop-profile-dropdown" style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '0.5rem',
                      width: `${calculateDesktopProfileDropdownWidth()}px`,
                      minWidth: `${calculateDesktopProfileDropdownWidth()}px`,
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
                      }} className="navbar-dropdown-item" onClick={exportAllData}>
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
                      }} className="navbar-dropdown-item" onClick={switchGoogleAccount}>
                Switch Google Account
                      </button>
                      <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${constants.components.navbar.hr.thickness} solid ${constants.components.navbar.hr.color}` }} />
                      <a href="/logout" style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
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