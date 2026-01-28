import React from 'react';

/**
 * Shared layout component for legal pages (Privacy, Terms)
 * @param {string} title - Page title (e.g., "Privacy Policy")
 * @param {string} lastUpdated - Last updated date string (defaults to current date)
 * @param {React.ReactNode} children - Main content sections
 */
function LegalPageLayout({ title, lastUpdated, children }) {
  const defaultLastUpdated = lastUpdated || new Date().toLocaleDateString();

  return (
    <div className="bg-light min-vh-100">
      {/* Basic Navbar for context/navigation back home */}
      <nav className="navbar navbar-light bg-white border-bottom box-shadow mb-4">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">ME-DB</a>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h1 className="h2 mb-4">{title}</h1>
                <p className="text-muted mb-4">Last updated: {defaultLastUpdated}</p>

                {children}

                <div className="mt-5 pt-3 border-top">
                  <p className="small text-muted">
                    If you have any questions, contact us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalPageLayout;
