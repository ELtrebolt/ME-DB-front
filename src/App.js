import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import './App.css';

import Navbar from "./components/Navbar";

import CreateMedia from './pages/CreateMedia';
import ShowMediaList from './pages/ShowMediaList';
import ShowMediaDetails from './pages/ShowMediaDetails';
import UpdateMediaInfo from './pages/UpdateMediaInfo';
import About from "./pages/About";
import Intro from "./pages/Intro";
import NotFound from "./pages/NotFound";
import Export from "./pages/Export";

import { useEffect, useState } from "react";
const constants = require('./constants');

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try
      {
        const response = await fetch(constants['SERVER_URL'] + "/auth/login/success", {
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
  
  if(!isLoading)
  {
    return (
      <Router>
        <div>
          <Navbar user={user}/>
          <Routes>
            <Route path='/' element={user ? <Navigate to="/anime/collection"/> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/home' element={user ? <Navigate to="/anime/collection"/> : <Navigate to="/"/>} />

            <Route path='/:mediaType/collection' element={user ? <RestrictMediaType user={user} n={1}/> : <Navigate to="/"/>} />
            <Route path='/:mediaType/to-do' element={user ? <RestrictMediaType user={user} n={2}/> : <Navigate to="/"/>} />

            <Route path='/:mediaType/collection/create' element={<RestrictMediaType user={user} n={3}/>} />
            <Route path='/:mediaType/to-do/create' element={<RestrictMediaType user={user} n={4}/>} />

            <Route path='/:mediaType/:ID' element={<RestrictMediaType user={user} n={5}/>} />
            <Route path='/:mediaType/:ID/edit' element={<RestrictMediaType user={user} n={6}/>} />
            
            <Route path='/:mediaType/collection/export' element={<RestrictMediaType user={user} n={7}/>} />
            <Route path='/:mediaType/to-do/export' element={<RestrictMediaType user={user} n={7}/>} />

            <Route path='/404' element={<NotFound/>} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    );
  }
};

function RestrictMediaType({ user, n }) {
  const mediaTypes = ['anime', 'tv', 'movies', 'games']

  const { mediaType, ID } = useParams();

  if (mediaTypes.includes(mediaType)) {
    if(n === 1)
    {
      return <ShowMediaList user={user} toDo={false}/>;
    }
    else if(n === 2)
    {
      return <ShowMediaList user={user} toDo={true}/>;
    }
    else if(n === 3)
    {
      return <CreateMedia user={user} toDo={false}/>;
    }
    else if(n === 4)
    {
      return <CreateMedia user={user} toDo={true}/>;
    }
    else if(n === 5)
    {
      if(!isNaN(Number(ID)))
      {
        return <ShowMediaDetails user={user}/>;
      }
      return <Navigate to="/404" />;
    }
    else if(n === 6)
    {
      return <UpdateMediaInfo user={user} />;
    }
    else if(n === 7)
    {
      return <Export user={user} />;
    }
  } else {
    return <Navigate to="/404" />;
  }
}

export default App;