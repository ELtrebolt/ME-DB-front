import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 mt-auto">
      <div className="container text-center">
        <div className="d-flex justify-content-center gap-4 mb-2">
          <a href="/privacy" className="text-white-50 text-decoration-none small hover-white">Privacy Policy</a>
          <a href="/terms" className="text-white-50 text-decoration-none small hover-white">Terms of Service</a>
        </div>
        <div className="text-white-50 small">
          &copy; {new Date().getFullYear()} ME-DB
        </div>
      </div>
      <style>
        {`
          .hover-white:hover {
            color: #fff !important;
            text-decoration: underline !important;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;

