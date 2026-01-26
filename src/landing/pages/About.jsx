import React from 'react';
const theme = require('../../styling/theme');

const About = (props) => {

  return (
    <div className="container-fluid min-vh-100 px-0" style={{backgroundColor: theme.colors.background.primary}}>
      <div className="py-5 about-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="text-white">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3 about-title">About</h1>
              <div className="border-bottom border-3 border-white w-25 mx-auto"></div>
            </div>
            
            <div className="card shadow-soft border-0 mb-4 about-card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-body p-4">
                <p className="lead text-center mb-0 text-white about-content">
                  What's good! My name is Ethan, and I looooove anime.
                </p>
              </div>
            </div>

            <div className="card shadow-soft border-0 mb-4 about-card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-body p-4">
                <p className="text-center text-white about-content">
                  Like most people, I've got some pretty strong opinions on ranking my personal favorites.
                  One Piece is my #1, Fullmetal Alchemist: Brotherhood is a close 2nd, and I could go on 
                  and on about the rest of 'em. Some are good, some are legendary, and some are just 
                  downright bad.
                </p>
              </div>
            </div>

            <div className="card shadow-soft border-0 mb-4 about-card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-body p-4">
                <p className="text-center text-white about-content">
                  And I needed a better way than Google Docs to keep track of 'em all, so here we are!
                </p>
              </div>
            </div>

            <div className="card shadow-soft border-0 mb-4 about-card" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-body p-4">
                <p className="text-center text-white about-content">
                  After keeping records on my favorite media for years, I wanted to coalesce my 
                  rankings for Anime, Movies, TV Shows, and Video Games into one place. I hope you get 
                  the same enjoyment from looking at all your past media experiences!
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="badge bg-white text-primary fs-5 px-4 py-2 rounded-pill about-badge">
                Anime | Movies | TV Shows | Games
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default About;

