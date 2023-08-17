import React from 'react';
import '../App.css';

const About = (props) => {

  return (
    <div className='container'>
    <br></br>
    <div className='row'>
      <div className='col-md-1 m-auto'></div>
      <div className='col-md-10 m-auto text-center'>
        <h1 className='intro-title'>About</h1>
      </div>
      <div className='col-md-1 m-auto'></div>
    </div>
    <br></br>

    <div className='row'>
      <div className='col-md-2 m-auto'></div>
      <div className='col-md-8 m-auto'>
        <p>What’s good! My name is Ethan, and I looooove anime.</p>
      </div>
      <div className='col-md-2 m-auto'></div>
    </div>

    <div className='row'>
      <div className='col-md-2 m-auto'></div>
      <div className='col-md-8 m-auto center'>
        <p>Like most people, I’ve got some pretty strong opinions on ranking my personal favorites.
          One Piece is my #1, Fullmetal Alchemist: Brotherhood is a close 2nd, and I could go on 
          and on about the rest of ‘em. Some are good, some are legendary, and some are just 
          downright bad.</p>
      </div>
      <div className='col-md-2 m-auto'></div>
    </div>

    <div className='row'>
      <div className='col-md-2 m-auto'></div>
      <div className='col-md-8 m-auto'>
        <p>And I needed a better way than Google Docs to keep track of ‘em all, so here we are!</p>
      </div>
      <div className='col-md-2 m-auto'></div>
    </div>

    <div className='row'>
      <div className='col-md-2 m-auto'></div>
      <div className='col-md-8 m-auto center'>
        <p>After keeping records on my favorite media for 6+ years, I wanted to coalesce my 
          rankings for Anime, Movies, TV Shows, and Video Games into one place. I hope you get 
          the same enjoyment from looking at all your past media experiences!</p>
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

export default About;

