import React, { useState, useEffect, useRef, useCallback } from 'react';
import NewTypeModal from "../components/NewTypeModal";
import ImportModal from "../components/ImportModal";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const constants = require('../constants');
const theme = require('../theme');

const NavbarFunction = ({user, setUserChanged, newTypes}) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();
  const [navNewTypes, setNavNewTypes] = useState(newTypes);
  const [pendingNewType, setPendingNewType] = useState(null);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const mediaDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Sync local state with prop and handle pending navigation
  useEffect(() => {
    setNavNewTypes(newTypes);
    
    // If we were waiting for a new type to be created and it now exists in the list
    if (pendingNewType && newTypes.includes(pendingNewType)) {
      navigate(`/${pendingNewType}/collection`);
      setPendingNewType(null);
    }
  }, [newTypes, pendingNewType, navigate]);

  // Calculate dynamic width for mobile profile dropdown
  const calculateProfileDropdownWidth = () => {
    const labels = ['Export All Data', 'Import New List', 'View Profile', 'Switch Account', 'Logout'];
    const longestLabel = labels.reduce((a, b) => a.length > b.length ? a : b);
    
    // More conservative estimate: character count * smaller character width + padding
    // Using 0.75rem font size, roughly 6px per character + 24px padding (0.75rem * 2)
    const estimatedWidth = longestLabel.length * 6 + 24;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 100);
  };

  // Calculate dynamic width for mobile media dropdown
  const calculateMediaDropdownWidth = useCallback(() => {
    const staticLabels = ['Anime', 'TV Shows', 'Movies', 'Games', 'Add New'];
    const customLabels = navNewTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1));
    const allLabels = [...staticLabels, ...customLabels];
    const longestLabel = allLabels.reduce((a, b) => a.length > b.length ? a : b);
    
    // More conservative estimate: character count * smaller character width + padding
    // Using 0.75rem font size, roughly 6px per character + 24px padding (0.75rem * 2)
    const estimatedWidth = longestLabel.length * 6 + 24;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 80);
  }, [navNewTypes]);

  // Calculate dynamic width for desktop media dropdown
  const calculateDesktopMediaDropdownWidth = useCallback(() => {
    const staticLabels = ['Anime', 'TV Shows', 'Movies', 'Games', 'Add New'];
    const customLabels = navNewTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1));
    const allLabels = [...staticLabels, ...customLabels];
    const longestLabel = allLabels.reduce((a, b) => a.length > b.length ? a : b);
    
    // Desktop uses 0.875rem font size, roughly 7px per character + 32px padding (1rem * 2)
    const estimatedWidth = longestLabel.length * 7 + 32;
    
    // Add small buffer and ensure minimum width
    return Math.max(estimatedWidth, 100);
  }, [navNewTypes]);

  // Calculate dynamic width for desktop profile dropdown
  const calculateDesktopProfileDropdownWidth = () => {
    const labels = ['Export All Data', 'Import New List', 'View Profile', 'Switch Google Account', 'Logout'];
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
          // Don't set state immediately or navigate. Wait for App.js to update newTypes prop.
          setPendingNewType(newName);
          setUserChanged(true);
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

  const isMobile = window.innerWidth < 768;
  const navbarHeight = isMobile ? theme.components.navbar.mobile.height : theme.components.navbar.height;
  const logoFontSize = isMobile ? theme.components.navbar.mobile.logoFontSize : theme.components.navbar.logoFontSize;

  return (
    <nav style={{
      backgroundColor: theme.components.navbar.colors.background,
      boxShadow: theme.components.navbar.shadow,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: `1px solid ${theme.components.navbar.colors.border}`
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
          height: navbarHeight
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href={user ? (user.customizations?.homePage ? `/${user.customizations.homePage}` : "/anime/collection") : "/"} style={{
              fontSize: logoFontSize,
              fontWeight: 'bold',
              color: theme.components.navbar.colors.text.dark,
              textDecoration: 'none'
            }}>
              ME-DB
            </a>
          </div>

          {/* Mobile Navigation */}
          {user && isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              {/* Mobile About and Stats Links */}
              <a href="/about" style={{
                color: theme.components.navbar.colors.text.default,
                textDecoration: 'none',
                fontSize: theme.components.navbar.mobile.linkFontSize,
                transition: theme.components.navbar.linkTransition,
                padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover} onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}>
                About
              </a>
              <a href="/stats" style={{
                color: theme.components.navbar.colors.text.default,
                textDecoration: 'none',
                fontSize: theme.components.navbar.mobile.linkFontSize,
                transition: theme.components.navbar.linkTransition,
                padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover} onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}>
                Stats
              </a>
              
              {/* Mobile Media Dropdown */}
              <div style={{ position: 'relative' }} ref={mediaDropdownRef}>
                <button
                  style={{
                    color: theme.components.navbar.colors.text.default,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    fontSize: theme.components.navbar.mobile.linkFontSize,
                    transition: theme.components.navbar.linkTransition,
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover}
                  onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}
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
                    marginTop: theme.spacing.sm,
                    width: `${calculateMediaDropdownWidth()}px`,
                    minWidth: `${calculateMediaDropdownWidth()}px`,
                    backgroundColor: theme.components.navbar.colors.dropdownBackground,
                    borderRadius: theme.components.navbar.borderRadius,
                    boxShadow: theme.components.navbar.dropdownShadow,
                    border: `1px solid ${theme.components.navbar.colors.border}`,
                    zIndex: 2000,
                    padding: '0.125rem 0'
                  }}>
                      <a href="/anime/collection" className="navbar-dropdown-item" style={{
                        display: 'block',
                        padding: theme.components.navbar.mobile.dropdownPadding,
                        fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }}>
                        Anime
                      </a>
                    <a href="/tv/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      TV Shows
                    </a>
                    <a href="/movies/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Movies
                    </a>
                    <a href="/games/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Games
                    </a>
                    {navNewTypes.length > 0 && <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />}
                    {navNewTypes.length > 0 && navNewTypes.map((item, index) => (
                      <a key={index} href={`/${item}/collection`} style={{
                        display: 'block',
                        padding: theme.components.navbar.mobile.dropdownPadding,
                        fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </a>
                    ))}
                    <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
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
                    gap: theme.spacing.xs,
                    color: theme.components.navbar.colors.text.default,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: theme.components.navbar.linkTransition,
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover}
                  onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    style={{
                      width: theme.components.navbar.mobile.profileImageSize,
                      height: theme.components.navbar.mobile.profileImageSize,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      backgroundColor: theme.components.navbar.colors.avatarBackground,
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.log('Profile picture failed to load:', user.profilePic);
                      // Replace image with username text
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector('.username-fallback')) {
                        e.target.style.display = 'none';
                        const span = document.createElement('span');
                        span.className = 'username-fallback';
                        span.textContent = user.username || user.displayName;
                        span.style.fontSize = theme.components.navbar.mobile.dropdownItemFontSize;
                        span.style.fontWeight = '500';
                        span.style.maxWidth = '128px';
                        span.style.overflow = 'hidden';
                        span.style.textOverflow = 'ellipsis';
                        span.style.whiteSpace = 'nowrap';
                        parent.insertBefore(span, parent.lastChild);
                      }
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
                    marginTop: theme.spacing.sm,
                    width: `${calculateProfileDropdownWidth()}px`,
                    minWidth: `${calculateProfileDropdownWidth()}px`,
                    backgroundColor: theme.components.navbar.colors.dropdownBackground,
                    borderRadius: theme.components.navbar.borderRadius,
                    boxShadow: theme.components.navbar.dropdownShadow,
                    border: `1px solid ${theme.components.navbar.colors.border}`,
                    zIndex: 2000,
                    padding: `${theme.spacing.xs} 0`
                  }}>
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.375rem 0.75rem',
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
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
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={() => setShowImportModal(true)}>
                      Import New List
                    </button>
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.375rem 0.75rem',
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}>
                      View Profile
                    </button>
                    <button style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.375rem 0.75rem',
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }} className="navbar-dropdown-item" onClick={switchGoogleAccount}>
                      Switch Account
                    </button>
                    <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />
                    <a href="/logout" style={{
                      display: 'block',
                      padding: '0.375rem 0.75rem',
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
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
          {user && !isMobile && (
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
                  color: theme.components.navbar.colors.text.default,
                  textDecoration: 'none',
                  transition: theme.components.navbar.linkTransition
                }} onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover} onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}>
                  About
                </a>
                <a href="/stats" style={{
                  color: theme.components.navbar.colors.text.default,
                  textDecoration: 'none',
                  transition: theme.components.navbar.linkTransition
                }} onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover} onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}>
                  Stats
                </a>
                
                {/* Media Dropdown */}
                <div style={{ position: 'relative' }} ref={mediaDropdownRef}>
                  <button
                    style={{
                      color: theme.components.navbar.colors.text.default,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                      fontSize: theme.components.navbar.linkFontSize,
                      transition: theme.components.navbar.linkTransition
                    }}
                    onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover}
                    onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}
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
                      marginTop: theme.spacing.sm,
                      width: `${calculateDesktopMediaDropdownWidth()}px`,
                      minWidth: `${calculateDesktopMediaDropdownWidth()}px`,
                      backgroundColor: theme.components.navbar.colors.dropdownBackground,
                      borderRadius: theme.components.navbar.borderRadius,
                      boxShadow: theme.components.navbar.dropdownShadow,
                      border: `1px solid ${theme.components.navbar.colors.border}`,
                      zIndex: 2000,
                      padding: '0.125rem 0'
                    }}>
                      <a href="/anime/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Anime
                      </a>
                      <a href="/tv/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        TV Shows
                      </a>
                      <a href="/movies/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Movies
                      </a>
                      <a href="/games/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Games
                      </a>
                      {navNewTypes.length > 0 && <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />}
                      {navNewTypes.length > 0 && navNewTypes.map((item, index) => (
                        <a key={index} href={`/${item}/collection`} style={{
                          display: 'block',
                          padding: theme.components.navbar.desktop.dropdownPadding,
                          fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                          color: theme.components.navbar.colors.dropdownItemText,
                          textDecoration: 'none'
                        }} className="navbar-dropdown-item">
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                      ))}
                      <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
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
                      gap: theme.spacing.sm,
                      color: theme.components.navbar.colors.text.default,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: theme.components.navbar.linkTransition
                    }}
                    onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover}
                    onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      style={{
                        width: theme.components.navbar.desktop.profileImageSize,
                        height: theme.components.navbar.desktop.profileImageSize,
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        console.log('Profile picture failed to load:', user.profilePic);
                        // Replace image with username text
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.username-fallback')) {
                          e.target.style.display = 'none';
                          const span = document.createElement('span');
                          span.className = 'username-fallback';
                          span.textContent = user.username || user.displayName;
                          span.style.fontSize = theme.components.navbar.desktop.dropdownItemFontSize;
                          span.style.fontWeight = '500';
                          span.style.maxWidth = '128px';
                          span.style.overflow = 'hidden';
                          span.style.textOverflow = 'ellipsis';
                          span.style.whiteSpace = 'nowrap';
                          parent.insertBefore(span, parent.lastChild);
                        }
                      }}
                    />
                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="desktop-profile-dropdown" style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: theme.spacing.sm,
                      width: `${calculateDesktopProfileDropdownWidth()}px`,
                      minWidth: `${calculateDesktopProfileDropdownWidth()}px`,
                      backgroundColor: theme.components.navbar.colors.dropdownBackground,
                      borderRadius: theme.components.navbar.borderRadius,
                      boxShadow: theme.components.navbar.dropdownShadow,
                      border: `1px solid ${theme.components.navbar.colors.border}`,
                      zIndex: 2000,
                      padding: `${theme.spacing.xs} 0`
                    }}>
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: theme.components.navbar.desktop.dropdownPaddingLarge,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
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
                        padding: theme.components.navbar.desktop.dropdownPaddingLarge,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} className="navbar-dropdown-item" onClick={() => setShowImportModal(true)}>
                Import New List
                      </button>
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: theme.components.navbar.desktop.dropdownPaddingLarge,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} className="navbar-dropdown-item" onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}>
                View Profile
                      </button>
                      <button style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: theme.components.navbar.desktop.dropdownPaddingLarge,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }} className="navbar-dropdown-item" onClick={switchGoogleAccount}>
                Switch Google Account
                      </button>
                      <hr style={{ margin: '0.125rem 0', border: 'none', borderTop: `${theme.components.navbar.hr.thickness} solid ${theme.components.navbar.hr.color}` }} />
                      <a href="/logout" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPaddingLarge,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
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
        <>
          <NewTypeModal show={showModal} setShow={setShowModal} onSaveClick={onCreateNewType} />
          <ImportModal 
            show={showImportModal} 
            setShow={setShowImportModal} 
            user={user}
            onImportComplete={() => setUserChanged(true)} 
          />
        </>
      ) : null}
    </nav>
  );
}

export default NavbarFunction