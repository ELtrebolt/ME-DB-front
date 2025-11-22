import React from 'react';
const constants = require('../constants');

const google = () => {
  window.open(constants['SERVER_URL'] + "/auth/google", "_self");
}

const Intro = (props) => {

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center intro-container" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12 text-center text-white">
            <div className="mb-4">
              <h1 className="display-3 fw-bold mb-3 intro-title text-white">Welcome to ME-DB</h1>
              <h2 className="h4 opacity-75 intro-subtitle">Your Media Entertainment Database</h2>
              <div className="border-bottom border-3 border-white w-25 mx-auto mt-3"></div>
            </div>
            
            <div className="mb-4 d-flex justify-content-center">
              <div className="google-btn" onClick={google}>
                <div className="google-icon-wrapper">
                  <img className="google-icon" alt='Google logo' src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"/>
                </div>
                <span className="btn-text">Sign in with Google</span>
              </div>
            </div>

            <hr className="border-white opacity-25 mb-4" />
            
            <div className="text-center mb-4">
              <div className="text-warning fs-4 fw-semibold mb-3">
                Customize your own Tier Lists
              </div>
              <div className="text-white fs-5 opacity-90 intro-text">
                <div className="mb-2">Your Collection • Your To-Do List • <span className="text-nowrap">All in One</span></div>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-center">
              <div className="badge bg-white text-primary fs-5 px-3 py-2 rounded-pill intro-badge">
                Anime | Movies | TV Shows | Games
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;

