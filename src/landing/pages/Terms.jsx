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
                  <h5 className="fw-bold mb-3">Acceptance of Terms</h5>
                  <p className="mb-0">
                    By accessing or using ME-DB, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Eligibility</h5>
                  <p className="mb-0">
                    You must be at least 13 years old to use this service. By using the service, you represent that you are at least 13 years old and have the legal capacity to enter into these terms.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Account Responsibilities</h5>
                  <p className="mb-3">You are responsible for:</p>
                  <ul className="mb-3">
                    <li>Maintaining the security of your account</li>
                    <li>All activities that occur under your account</li>
                    <li>The accuracy of information you provide</li>
                    <li>Any content you create, upload, or share</li>
                  </ul>
                  <p className="mb-0">
                    You must not share your account credentials with others or use another person's account.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">User-Generated Content</h5>
                  <p className="mb-3">
                    You retain ownership of all content you create in the app (media entries, tier lists, descriptions, tags, etc.). By using the service, you grant us a license to store, display, and process your content solely for the purpose of providing the service.
                  </p>
                  <p className="mb-3">You agree not to create, upload, or share content that:</p>
                  <ul className="mb-0">
                    <li>Is illegal, harmful, or violates any laws</li>
                    <li>Infringes on intellectual property rights of others</li>
                    <li>Contains hate speech, harassment, or threats</li>
                    <li>Is spam, malware, or malicious code</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Sharing Functionality</h5>
                  <p className="mb-3">
                    The app allows you to create shareable links that make your tier lists publicly viewable. When you create a shareable link:
                  </p>
                  <ul className="mb-3">
                    <li>Anyone with the link can view the content you've selected to share</li>
                    <li>Shared content is publicly accessible and not password-protected</li>
                    <li>You are responsible for what you choose to share</li>
                    <li>You can stop sharing by deleting the shareable link</li>
                  </ul>
                  <p className="mb-0">
                    We are not responsible for how others use or share links you create.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Service Availability</h5>
                  <p className="mb-3">
                    This app is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that:
                  </p>
                  <ul className="mb-3">
                    <li>The service will be available at all times</li>
                    <li>The service will be error-free or uninterrupted</li>
                    <li>Your data will never be lost or corrupted</li>
                  </ul>
                  <p className="mb-0">
                    We may modify, suspend, or discontinue the service at any time with or without notice. We recommend regularly exporting your data as a backup.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Intellectual Property</h5>
                  <p className="mb-0">
                    The ME-DB service, including its design, features, and functionality, is owned by us and protected by intellectual property laws. You may not copy, modify, or create derivative works of the service without our permission.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Limitation of Liability</h5>
                  <p className="mb-0">
                    To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, profits, or business opportunities, resulting from your use of the service.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Account Termination</h5>
                  <p className="mb-3">
                    We reserve the right to suspend or terminate your account at any time if you:
                  </p>
                  <ul className="mb-3">
                    <li>Violate these Terms of Service</li>
                    <li>Engage in fraudulent, abusive, or illegal activity</li>
                    <li>Infringe on the rights of others</li>
                    <li>Fail to pay any fees (if applicable in the future)</li>
                  </ul>
                  <p className="mb-0">
                    You may delete your account at any time by contacting us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Changes to Terms</h5>
                  <p className="mb-0">
                    We may update these Terms of Service from time to time. We will notify you of material changes by updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-top">
                  <p className="small text-muted">
                    For questions about these terms, contact us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>.
                  </p>
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

