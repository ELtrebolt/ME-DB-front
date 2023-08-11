import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Intro = (props) => {

  return (
    <div >
        <Link
            to='/login'
        >
            Log In
        </Link>
    </div>
  );
};

export default Intro;

