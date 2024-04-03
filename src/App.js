import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import './App.css';

// Components
import Navbar from "./components/Navbar";
// Pages
import CreateMedia from './pages/CreateMedia';
import ShowMediaList from './pages/ShowMediaList';
import ShowMediaDetails from './pages/ShowMediaDetails';
import UpdateMediaInfo from './pages/UpdateMediaInfo';
import About from "./pages/About";
import Intro from "./pages/Intro";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";
// Other
import { useEffect, useState } from "react";
import axios from 'axios';
const constants = require('./constants');

const App = () => {
  axios.defaults.withCredentials = true;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userChanged, setUserChanged] = useState(false);
  const [newTypes, setNewTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // function onUserChanged({foo}) {
  //   setUserChanged(true);
  //   foo();
  // }
  useEffect(() => {
    // get User data from MongoDB, use for TierTitle and AddNewType
    const getUser = async () => {
      if(!user || userChanged)
      {
        axios
        .get(constants['SERVER_URL'] + '/auth/login/success', {withCredentials: true})
        .then((res) => {
          setUser(res.data.user);
          setNewTypes(Object.keys(res.data.user.newTypes));
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
  if(!isLoading && !userChanged)
  {
    return (
      <Router>
        <div>
          <Navbar user={user} setUserChanged={setUserChanged} newTypes={newTypes}/>
          <Routes>
            <Route path='/' element={user ? <Navigate to="/anime/collection"/> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/home' element={user ? <Navigate to="/anime/collection"/> : <Navigate to="/"/>} />
            <Route path='/logout' element={<Logout/>} />

            <Route path='/:mediaType/collection/create' element={<RestrictMediaType user={user} n={3} setUserChanged={setUserChanged} newTypes={newTypes}/>} />
            <Route path='/:mediaType/to-do/create' element={<RestrictMediaType user={user} n={4} setUserChanged={setUserChanged} newTypes={newTypes}/>} />

            <Route path='/:mediaType/:group' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>} />
            <Route path='/:mediaType/:group/edit' element={<RestrictMediaType user={user} n={6} setUserChanged={setUserChanged} newTypes={newTypes}/>} />
            
            <Route path='/404' element={<NotFound/>} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    );
  }
};

function RestrictMediaType({ user, n, setUserChanged, newTypes, selectedTags, setSelectedTags}) {
  const defaultTypes = ['anime', 'tv', 'movies', 'games']
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
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={false} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>;
      }
      else if(group === "to-do")
      {
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={true} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>;
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
    console.log(n, group);
    console.log(mediaType, 'not valid type', mediaTypes);
    return <Navigate to="/404" />;
  }
}

export default App;