import React, { useState, useEffect } from 'react';
const constants = require('../../app/constants');
const theme = require('../../styling/theme');

const google = () => {
  window.open(constants['SERVER_URL'] + "/auth/google", "_self");
};

/**
 * Shared layout component for legal pages (Privacy, Terms)
 * @param {string} title - Page title (e.g., "Privacy Policy")
 * @param {string} lastUpdated - Last updated date string (defaults to current date)
 * @param {React.ReactNode} children - Main content sections
 */
function LegalPageLayout({ title, lastUpdated, children }) {
  const defaultLastUpdated = lastUpdated || new Date().toLocaleDateString();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '/#about' },
    { label: 'Features', href: '/#features' },
    { label: 'Why', href: '/#why' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* IntroNavbar-style navbar */}
      <nav className={`navbar navbar-expand-md fixed-top transition-all duration-300`} 
           style={{ 
             transition: 'all 0.3s ease', 
             padding: isScrolled ? '0.5rem 1rem' : '1rem 1rem',
             backgroundColor: isScrolled ? '#ffffff' : '#f8f9fa',
             boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
           }}>
        <div className="container">
          {/* Logo - Left */}
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="/"
             style={{ 
               fontSize: '1.5rem',
               color: theme.components.introPage.navbar.textColorScrolled
             }}>
            <img src="/favicon.ico" alt="ME-DB" style={{ width: '32px', height: '32px' }} />
            ME-DB
          </a>

          {/* Mobile Sign In Button - visible on mobile only */}
          <button 
            onClick={google}
            className="btn btn-dark rounded-pill px-3 fw-bold d-md-none"
            style={{ fontSize: '0.85rem' }}
          >
            Sign In
          </button>

          {/* Mobile Toggle */}
          <button 
            className="navbar-toggler border-0 d-md-none" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#legalNavbar"
            style={{ boxShadow: 'none' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links - Center */}
          <div className="collapse navbar-collapse" id="legalNavbar">
            <ul className="navbar-nav mx-auto mb-2 mb-md-0">
              {navLinks.map((link) => (
                <li className="nav-item" key={link.label}>
                  <a 
                    className="nav-link px-3 fw-medium"
                    href={link.href}
                    style={{ 
                      color: theme.components.introPage.navbar.textColorScrolled,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Sign In - Right (Desktop only) */}
            <button 
              onClick={google}
              className="btn btn-dark rounded-pill px-4 fw-bold d-none d-md-block"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '80px' }}></div>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h1 className="h2 mb-4">{title}</h1>
                <p className="text-muted mb-4">Last updated: {defaultLastUpdated}</p>

                {children}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalPageLayout;
