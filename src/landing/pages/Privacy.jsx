import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const Privacy = () => {
  return (
    <LegalPageLayout title="Privacy Policy">
      <div className="mb-4">
                  <h5 className="fw-bold mb-3">Information We Collect</h5>
                  <p className="mb-3">
                    When you sign in with Google, we collect basic account information including:
                  </p>
                  <ul className="mb-3">
                    <li>Your Google user ID</li>
                    <li>Your display name</li>
                    <li>Your profile picture URL</li>
                  </ul>
                  <p className="mb-3">
                    You also create and store content in the app, including:
                  </p>
                  <ul className="mb-3">
                    <li>Media entries (titles, years, ratings, tags, descriptions)</li>
                    <li>Custom media types and categories</li>
                    <li>Tier lists and rankings</li>
                    <li>Collection and to-do lists</li>
                    <li>App preferences and settings</li>
                  </ul>
                  <p className="mb-0">
                    We may also collect technical information such as your IP address, browser type, and device information to provide and improve the service.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">How We Use Your Information</h5>
                  <p className="mb-3">We use your information to:</p>
                  <ul className="mb-0">
                    <li>Create and manage your account</li>
                    <li>Authenticate you when you sign in</li>
                    <li>Store and display your media lists, tier rankings, and custom content</li>
                    <li>Provide sharing functionality when you choose to share your lists</li>
                    <li>Generate statistics and insights about your collections</li>
                    <li>Improve and maintain the app</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Sharing Your Data</h5>
                  <p className="mb-3">
                    We do not sell your data or share it with third parties for marketing purposes.
                  </p>
                  <p className="mb-3">
                    If you choose to create a shareable link, the content you select to share (your tier lists and media entries) will be publicly accessible to anyone with the link. You control what content is shared through the sharing settings.
                  </p>
                  <p className="mb-0">
                    We may share your data if required by law or to protect our rights and safety.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Data Security</h5>
                  <p className="mb-0">
                    Your data is stored securely using industry-standard security measures. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Your Rights</h5>
                  <p className="mb-3">You have the right to:</p>
                  <ul className="mb-3">
                    <li>Access your personal data</li>
                    <li>Request deletion of your account and all associated data</li>
                    <li>Export your data (available through the app's export feature)</li>
                    <li>Stop sharing your lists by deleting shareable links</li>
                  </ul>
                  <p className="mb-0">
                    To exercise these rights, contact us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Data Retention</h5>
                  <p className="mb-0">
                    We retain your data for as long as your account is active. If you request account deletion, we will delete your data within 30 days, except where we are required to retain it by law.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Children's Privacy</h5>
                  <p className="mb-0">
                    This app is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Changes to This Policy</h5>
                  <p className="mb-0">
                    We may update this privacy policy from time to time. We will notify you of any material changes by updating the "Last updated" date at the top of this page.
                  </p>
                </div>

    </LegalPageLayout>
  );
};

export default Privacy;

