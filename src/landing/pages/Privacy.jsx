import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const Privacy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 31, 2026">
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Information We Collect</h5>
        <p className="mb-3">
          When you sign in using Google, we collect basic account information provided by Google, including:
        </p>
        <ul className="mb-3">
          <li>Google user ID</li>
          <li>Display name</li>
          <li>Profile picture URL</li>
          <li>Email address</li>
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
          We may also collect limited technical information such as IP address, browser type, and device information to help operate and secure the service.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">How We Use Your Information</h5>
        <p className="mb-3">We use the information we collect only to:</p>
        <ul className="mb-3">
          <li>Create and manage your account</li>
          <li>Authenticate you when signing in</li>
          <li>Store and display your media lists, tier rankings, and other content</li>
          <li>Enable sharing features when you choose to share content</li>
          <li>Maintain, secure, and improve the app</li>
        </ul>
        <p className="mb-0">
          We do not use your data for advertising, marketing, or profiling.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Google User Data</h5>
        <p className="mb-3">
          The app&apos;s use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.
        </p>
        <p className="mb-0">
          Google user data is accessed only to provide core app functionality and is not used for advertising or shared with third parties.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Sharing of Information</h5>
        <p className="mb-3">
          We do not sell or share personal information with third parties for marketing or advertising purposes.
        </p>
        <p className="mb-3">
          If you choose to create a shareable link, the specific content you select (such as tier lists or media entries) will be publicly accessible to anyone with the link. You can control or disable sharing at any time by deleting shared links.
        </p>
        <p className="mb-0">
          We may disclose information if required by law or to protect the security, rights, or safety of the app and its users.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Data Security</h5>
        <p className="mb-0">
          We take reasonable measures to protect your information from unauthorized access, loss, or misuse. However, no system can be guaranteed to be completely secure.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Your Rights</h5>
        <p className="mb-3">You have the right to:</p>
        <ul className="mb-3">
          <li>Access the personal data associated with your account</li>
          <li>Request deletion of your account and all associated data</li>
          <li>Export your data using the app&apos;s export features</li>
          <li>Disable or remove shared content</li>
        </ul>
        <p className="mb-0">
          To exercise these rights, contact us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>. We may verify requests by confirming access to the associated account.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">California Privacy Rights</h5>
        <p className="mb-3">
          If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA/CPRA), including the right to access or delete your personal information.
        </p>
        <p className="mb-0">
          We do not sell or share personal information as defined by California law, and we do not discriminate against users for exercising their privacy rights.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Data Retention</h5>
        <p className="mb-0">
          We retain your information for as long as your account is active. When you request account deletion, your data will be deleted within 30 days unless retention is required by law.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Children&apos;s Privacy</h5>
        <p className="mb-0">
          The app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe such information has been collected, please contact us so it can be removed.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Changes to This Policy</h5>
        <p className="mb-0">
          We may update this Privacy Policy from time to time. Updates will be reflected by revising the &quot;Last updated&quot; date at the top of this page.
        </p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold mb-3">Contact</h5>
        <p className="mb-0">
          If you have any questions about this Privacy Policy or your data, contact us at <a href="mailto:leeep.dev@gmail.com">leeep.dev@gmail.com</a>.
        </p>
      </div>

    </LegalPageLayout>
  );
};

export default Privacy;

