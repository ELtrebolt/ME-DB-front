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

import { useEffect, useState } from "react";
import axios from 'axios';
const constants = require('./constants');

const App = () => {
  axios.defaults.withCredentials = true;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userChanged, setUserChanged] = useState(false);

  // function onUserChanged({foo}) {
  //   setUserChanged(true);
  //   foo();
  // }
  useEffect(() => {
    const getUser = async () => {
      if(!user || userChanged)
      {
        axios
        .get(constants['SERVER_URL'] + '/auth/login/success', {withCredentials: true})
        .then((res) => {
          // console.log("GET /auth/login/success", res)
          setUser(res.data.user);
          setUserChanged(false);
        })
        .catch((err) => {
          console.log('Error from client/App.jsx:');
        })
        .finally(() => {
          setIsLoading(false);
        })
        ;
      }
    };
    getUser();
  });
  
  console.log("userChanged", userChanged)
  console.log("user", user);
  if(!isLoading)
  {
    return (
      <Router>
        <div>
          <Navbar user={user} setUserChanged={setUserChanged}/>
          <Routes>
            <Route path='/' element={user ? <Navigate to="/anime/collection"/> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/home' element={user ? <Navigate to="/anime/collection"/> : <Navigate to="/"/>} />

            <Route path='/:mediaType/collection/create' element={<RestrictMediaType user={user} n={3} setUserChanged={setUserChanged}/>} />
            <Route path='/:mediaType/to-do/create' element={<RestrictMediaType user={user} n={4} setUserChanged={setUserChanged}/>} />

            <Route path='/:mediaType/:group' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged}/>} />
            <Route path='/:mediaType/:group/edit' element={<RestrictMediaType user={user} n={6} setUserChanged={setUserChanged}/>} />
            
            <Route path='/404' element={<NotFound/>} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    );
  }
};

function RestrictMediaType({ user, n, setUserChanged}) {
  const defaultTypes = ['anime', 'tv', 'movies', 'games']
  const newTypes = Object.keys(user.newTypes);
  var mediaTypes;
  if(newTypes.length > 0) {
    mediaTypes = [...defaultTypes, ...newTypes];
  } else {
    mediaTypes = defaultTypes;
  }
  const { mediaType, group } = useParams();
  const newType = newTypes.includes(mediaType);

  if (mediaTypes.includes(mediaType)) {
    if(n === 3)
    {
      return <CreateMedia user={user} toDo={false} newType={newType}/>;
    }
    else if(n === 4)
    {
      return <CreateMedia user={user} toDo={true} newType={newType}/>;
    }
    else if(n === 5)
    {
      if(!isNaN(group))
      {
        return <ShowMediaDetails user={user} newType={newType}/>;
      }
      else if(group === "collection")
      {
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={false} newType={newType}/>;
      }
      else if(group === "to-do")
      {
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={true} newType={newType}/>;
      }
      else {
        return <Navigate to="/404" />;
      }
    }
    else if(n === 6)
    {
      return <UpdateMediaInfo user={user} newType={newType} />;
    }
  } else {
    console.log(mediaType, 'not valid type', mediaTypes)
    return <Navigate to="/404" />;
  }
}

export default App;