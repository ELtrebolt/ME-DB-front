import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import CreateMedia from './components/CreateMedia';
import ShowMediaList from './components/ShowMediaList';
import ShowMediaDetails from './components/ShowMediaDetails';
import UpdateMediaInfo from './components/UpdateMediaInfo';

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Intro from "./pages/Intro";

import { useEffect, useState } from "react";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const getUser = async () => {
  //     fetch("http://localhost:8082/auth/login/success", {
  //       method: "GET",
  //       credentials: "include",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         "Access-Control-Allow-Credentials": true,
  //       },
  //     })
  //       .then((response) => {
  //         if (response.status === 200)
  //         {
  //           return response.json();
  //         }
  //         throw new Error("authentication has been failed!");
  //       })
  //       .then((resObject) => {
  //         setUser(resObject.user);
  //       })
  //       .catch((err) => {
          
  //         console.log(err);
  //       })
  //   };
  //   getUser();
  // }, []);

  useEffect(() => {
    const getUser = async () => {
      try
      {
        const response = await fetch("http://localhost:8082/auth/login/success", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
          },
        })
        if (response.status === 200)
        {
          console.log("Auth Response received");
          const data = await response.json();
          setUser(data.user);
        }
        else
        {
          throw new Error("authentication has been failed!");
        }
      }
      catch(err) {
        console.log(err);
      }
      finally {
        setIsLoading(false);
      }
    };
    getUser();
  }, []);

  // console.log("Loading:" + isLoading);
  // console.log(user);
  
  if(!isLoading)
  {
    // console.log("User Total: ", userTotal)
    return (
      <Router>
        <div>
          <Navbar user={user}/>
          <Routes>
            <Route path='/' element={user ? <Navigate to="/home"/> : <Intro />} />

            <Route path='/create-media' element={<CreateMedia user={user}/>} />
            <Route path='/edit-media/:mediaType/:ID' element={<UpdateMediaInfo user={user}/>} />
            <Route path='/show-media/:mediaType/:ID' element={<ShowMediaDetails user={user}/>} />

            <Route path='/home' element={user ? <ShowMediaList user={user}/> : <Navigate to="/login"/>} />
            <Route path='/login' element={user ? <Navigate to="/home"/> : <Login />} />
          </Routes>
        </div>
      </Router>
    );
  }
};

export default App;