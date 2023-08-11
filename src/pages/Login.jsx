import React from 'react';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

const Login = () => {

  const google = () => {
    window.open("http://localhost:8082/auth/google", "_self");
  }

  return (
    <div className="login">
      <h1 className="loginTitle">Choose a Login Method</h1>
      <div className="wrapper">
        <div className="left">
          <div>
            <MDBBtn className="loginButton" style={{ backgroundColor: '#dd4b39' }} onClick={google}>
                <MDBIcon className='me-2' fab icon='google' /> Google
            </MDBBtn>
          </div>
          <div>
            <MDBBtn className="loginButton" style={{ backgroundColor: '#3b5998' }} href='#'>
                <MDBIcon className='me-2' fab icon='facebook' /> Facebook
            </MDBBtn>
          </div>
        </div>
        <div className="center">
          <div className="line" />
          <div className="or">OR</div>
        </div>
        <div className="right">
          <input className="inputBox" type="text" placeholder="Username" />
          <input className="inputBox" type="password" placeholder="Password" />
          <button className="submit">Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;