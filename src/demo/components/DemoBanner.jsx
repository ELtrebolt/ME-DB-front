import React from 'react';
const theme = require('../../styling/theme');

const DemoBanner = ({ storageAvailable = true }) => {
  // Calculate navbar height for sticky positioning
  const isMobile = window.innerWidth < 768;
  const navbarHeight = isMobile ? theme.components.navbar.mobile.height : theme.components.navbar.height;
  
  // Common sticky styles
  const stickyStyles = {
    position: 'sticky',
    top: navbarHeight,
    zIndex: 40,
    width: '100%'
  };

  // Show warning banner if localStorage is not available
  if (!storageAvailable) {
    return (
      <div style={{
        ...stickyStyles,
        backgroundColor: '#dc3545',
        color: '#ffffff',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>
          <strong>Demo Mode</strong> - Storage unavailable (private browsing?). Changes won't persist after refresh.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      ...stickyStyles,
      backgroundColor: '#ffc107',
      color: '#1f2937',
      padding: isMobile ? '5px 8px' : '6px 12px',
      textAlign: 'center',
      fontSize: isMobile ? '0.65rem' : '0.75rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '4px' : '6px',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      lineHeight: 1.25
    }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={isMobile ? 12 : 14} 
        height={isMobile ? 12 : 14} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>
        <strong>Demo Mode</strong> - Data is saved to browser, sign in for permanent storage
      </span>
    </div>
  );
};

export default DemoBanner;
