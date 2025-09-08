import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

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
import Stats from './pages/Stats';
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
  const [filteredData, setFilteredData] = useState();

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
          setNewTypes(Object.keys(res.data.user.newTypes))
          setUserChanged(false);
        })
        .catch((err) => {
          console.log('Error from client/App.jsx:');
          console.log('Error details:', err);
          console.log('Error response:', err.response);
          console.log('Error status:', err.response?.status);
          console.log('Error data:', err.response?.data);
          // If authentication fails, ensure user is set to null
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        })
        ;
      }
    };
    getUser();
  });

  // Session refresh mechanism - refresh session every 30 minutes
  useEffect(() => {
    if (user) {
      const sessionRefreshInterval = setInterval(() => {
        axios
          .get(constants['SERVER_URL'] + '/auth/login/success', {withCredentials: true})
          .then((res) => {
            if (res.data.success) {
              console.log('Session refreshed successfully');
            } else {
              console.log('Session expired, redirecting to login');
              setUser(null);
            }
          })
          .catch((err) => {
            console.log('Session refresh failed:', err);
            setUser(null);
          });
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(sessionRefreshInterval);
    }
  }, [user]);
  
  console.log("userChanged", userChanged)
  console.log("user", user);
  if(!isLoading && !userChanged)
  {
    return (
      <Router>
        <div>
          {user ? (
            <Navbar user={user} setUserChanged={setUserChanged} newTypes={newTypes}/>
          ) : null}
          <Routes>
            <Route path='/' element={user ? <Navigate to="/anime/collection"/> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/stats' element={user ? <Stats user={user}/> : <Navigate to="/"/>} />
            <Route path='/home' element={user ? <Navigate to="/anime/collection"/> : <Navigate to="/"/>} />
            <Route path='/logout' element={<Logout/>} />

            <Route path='/:mediaType/collection/create' element={<RestrictMediaType user={user} n={3} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>} />
            <Route path='/:mediaType/to-do/create' element={<RestrictMediaType user={user} n={4} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>} />

            <Route path='/:mediaType' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>} />
            <Route path='/:mediaType/:group' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>} />
            <Route path='/:mediaType/:id/edit' element={<RestrictMediaType user={user} n={6} setUserChanged={setUserChanged} newTypes={newTypes}/>} />
            
            <Route path='/404' element={<NotFound/>} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    );
  }
};

function RestrictMediaType({ user, n, setUserChanged, newTypes, selectedTags, setSelectedTags, filteredData, setFilteredData}) {
  const defaultTypes = ['anime', 'tv', 'movies', 'games']
  var mediaTypes;
  if(newTypes.length > 0) {
    mediaTypes = [...defaultTypes, ...newTypes];
  } else {
    mediaTypes = defaultTypes;
  }
  const { mediaType, group } = useParams();
  const newType = newTypes.includes(mediaType);

  // Clear tags when media type changes (navigating to different media type)
  useEffect(() => {
    if (setSelectedTags) {
      console.log('RestrictMediaType: Media type changed to:', mediaType);
      setSelectedTags([]);
      // Clear tags from sessionStorage if it exists
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('selectedTags');
      }
    }
  }, [mediaType, setSelectedTags]);

  if (mediaTypes.includes(mediaType)) {
    if(n === 3)
    {
      return <CreateMedia user={user} toDo={false} newType={newType} selectedTags={selectedTags}/>;
    }
    else if(n === 4)
    {
      return <CreateMedia user={user} toDo={true} newType={newType} selectedTags={selectedTags}/>;
    }
    else if(n === 5)
    {
      if(!isNaN(group))
      {
        return <ShowMediaDetails user={user} newType={newType} filteredData={filteredData}/>;
      }
      else if(group === "collection" || group === undefined)
      {
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={false} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>;
      }
      else if(group === "to-do")
      {
        return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={true} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>;
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