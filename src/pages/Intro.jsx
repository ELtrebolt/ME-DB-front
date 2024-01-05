import React from 'react';
import '../App.css';
const constants = require('../constants');

const google = () => {
  console.log('going to', constants['SERVER_URL'])
  window.open(constants['SERVER_URL'] + "/auth/google", "_self");
}

const Intro = (props) => {

  return (
    <div className='container'>
      <br></br>
      <div className='row'>
        <div className='col-md-1 m-auto'></div>
        <div className='col-md-10 m-auto text-center'>
          <h1 className='intro-title'>Welcome to ME-DB</h1>
          <h5 className='intro-subtitle'>Your Media Entertainment Database</h5>
        </div>
        <div className='col-md-1 m-auto'></div>
      </div>
      <br></br>

      <div className='row'>
        <div className='col-md-2 m-auto'></div>
        <div className='col-md-8 m-auto center'>
         <div className="google-btn" onClick={google}>
            <div className="google-icon-wrapper">
              <img className="google-icon" alt='logo' src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"/>
            </div>
            <p className="btn-text"><b>Sign in with Google</b></p>
          </div>
        </div>
        <div className='col-md-2 m-auto'></div>
      </div>
      <hr></hr>
      <br></br>

      <div className='row'>
        <div className='col-md-2 m-auto'></div>
        <div className='col-md-8 m-auto center'>
          <div>~Visualizing Your Tier List With Words~</div>
        </div>
        <div className='col-md-2 m-auto'></div>
      </div>

      <br></br>
      <div className='row'>
        <div className='col-md-2 m-auto'></div>
        <div className='col-md-8 m-auto center'>
        <div>Your Collection. Your To-Do List. All in one.</div>
        </div>
        <div className='col-md-2 m-auto'></div>
      </div>

      <br></br>
      <div className='row'>
        <div className='col-md-2 m-auto'></div>
        <div className='col-md-8 m-auto center'>
          <div className='intro-subtitle'>Anime | Movies | TV Shows | Games</div>
        </div>
        <div className='col-md-2 m-auto'></div>
      </div>

    </div>
  );
};

export default Intro;

