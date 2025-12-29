import React from 'react';

const Terms = () => {
  return (
    <div className="bg-light min-vh-100">
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
                <h1 className="h2 mb-4">Terms of Service</h1>
                <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mb-4">
                  <h5 className="fw-bold">1. Agreement to Terms</h5>
                  <p>By accessing or using ME-DB, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">2. Accounts</h5>
                  <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">3. Intellectual Property</h5>
                  <p>The Service and its original content, features and functionality are and will remain the exclusive property of ME-DB and its licensors.</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">4. Termination</h5>
                  <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">5. Limitation of Liability</h5>
                  <p>In no event shall ME-DB, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

