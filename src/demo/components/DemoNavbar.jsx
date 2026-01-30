import React, { useState, useEffect, useRef } from 'react';
import { useClickOutside } from '../../app/hooks/useClickOutside';
import { calculateDropdownWidth } from '../../app/helpers';
const theme = require('../../styling/theme');
const constants = require('../../app/constants');

const DemoNavbar = ({ user }) => {
  const handleSignIn = () => {
    if (user) {
      // User is already signed in, go to home
      window.location.href = '/';
    } else {
      // User is not signed in, go to Google auth
      window.open(constants['SERVER_URL'] + "/auth/google", "_self");
    }
  };
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const mediaDropdownRef = useRef(null);

  // Calculate dynamic width for mobile media dropdown
  const calculateMediaDropdownWidth = () => {
    const labels = ['Anime', 'TV Shows', 'Movies', 'Games'];
    return calculateDropdownWidth(labels, { variant: 'mobile', minWidth: 80 });
  };

  // Calculate dynamic width for desktop media dropdown
  const calculateDesktopMediaDropdownWidth = () => {
    const labels = ['Anime', 'TV Shows', 'Movies', 'Games'];
    return calculateDropdownWidth(labels, { variant: 'desktop', minWidth: 100 });
  };

  // Close dropdown when clicking outside
  useClickOutside(mediaDropdownRef, () => {
    setIsMediaMenuOpen(false);
  });

  // Set CSS custom properties for dynamic dropdown widths
  useEffect(() => {
    const mediaDropdownWidth = calculateMediaDropdownWidth();
    const desktopMediaDropdownWidth = calculateDesktopMediaDropdownWidth();
    
    document.documentElement.style.setProperty('--mobile-media-dropdown-width', `${mediaDropdownWidth}px`);
    document.documentElement.style.setProperty('--desktop-media-dropdown-width', `${desktopMediaDropdownWidth}px`);
  }, []);

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
        padding: isMobile ? '0 0.5rem' : '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: navbarHeight
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <a href="/" style={{
              fontSize: logoFontSize,
              fontWeight: 'bold',
              color: theme.components.navbar.colors.text.dark,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.25rem' : '0.5rem',
              whiteSpace: 'nowrap'
            }}>
              <img src="/favicon.ico" alt="ME-DB" style={{ width: isMobile ? '22px' : '32px', height: isMobile ? '22px' : '32px', flexShrink: 0 }} />
              ME-DB
            </a>
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {/* Mobile About Link */}
              <a href="/about" style={{
                color: theme.components.navbar.colors.text.default,
                textDecoration: 'none',
                fontSize: '0.75rem',
                transition: theme.components.navbar.linkTransition,
                padding: '0.25rem 0.35rem',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => e.target.style.color = theme.components.navbar.colors.text.hover} onMouseLeave={(e) => e.target.style.color = theme.components.navbar.colors.text.default}>
                About
              </a>

              {/* Mobile Stats Link */}
              <a href="/demo/stats" style={{
                color: theme.components.navbar.colors.text.default,
                textDecoration: 'none',
                fontSize: '0.75rem',
                transition: theme.components.navbar.linkTransition,
                padding: '0.25rem 0.35rem',
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
                    right: 0,
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
                    <a href="/demo/anime/collection" className="navbar-dropdown-item" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }}>
                      Anime
                    </a>
                    <a href="/demo/tv/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      TV Shows
                    </a>
                    <a href="/demo/movies/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Movies
                    </a>
                    <a href="/demo/games/collection" style={{
                      display: 'block',
                      padding: theme.components.navbar.mobile.dropdownPadding,
                      fontSize: theme.components.navbar.mobile.dropdownItemFontSize,
                      color: theme.components.navbar.colors.dropdownItemText,
                      textDecoration: 'none'
                    }} className="navbar-dropdown-item">
                      Games
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile Sign In Button */}
              <button 
                onClick={handleSignIn}
                className="btn btn-warning btn-sm rounded-pill px-2 fw-bold"
                style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
              >
                {user ? 'Go to App' : 'Sign In'}
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              {/* Navigation items */}
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
                <a href="/demo/stats" style={{
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
                      <a href="/demo/anime/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Anime
                      </a>
                      <a href="/demo/tv/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        TV Shows
                      </a>
                      <a href="/demo/movies/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Movies
                      </a>
                      <a href="/demo/games/collection" style={{
                        display: 'block',
                        padding: theme.components.navbar.desktop.dropdownPadding,
                        fontSize: theme.components.navbar.desktop.dropdownItemFontSize,
                        color: theme.components.navbar.colors.dropdownItemText,
                        textDecoration: 'none'
                      }} className="navbar-dropdown-item">
                        Games
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Sign In Button */}
              <button 
                onClick={handleSignIn}
                className="btn btn-warning rounded-pill px-4 fw-bold"
                style={{ fontSize: '0.9rem' }}
              >
                {user ? 'Go to App' : 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DemoNavbar;
