import React from 'react';

const Privacy = () => {
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
                <h1 className="h2 mb-4">Privacy Policy</h1>
                <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mb-4">
                  <h5 className="fw-bold">1. Introduction</h5>
                  <p>Welcome to ME-DB. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">2. Data We Collect</h5>
                  <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                  <ul>
                    <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data</strong> includes email address.</li>
                    <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">3. How We Use Your Data</h5>
                  <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                  <ul>
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">4. Data Security</h5>
                  <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
                </div>

                <div className="mt-5 pt-3 border-top">
                  <p className="small text-muted">Contact us if you have any questions about this privacy policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

