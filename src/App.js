import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

// Components
import Navbar from "./components/Navbar";
// Pages
import CreateMedia from './pages/CreateMedia';
import ShowMediaList from './pages/ShowMediaList';
import ShowMediaDetails from './pages/ShowMediaDetails';
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
  const [filteredData, setFilteredData] = useState({});

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
          setNewTypes(res.data.user?.newTypes ? Object.keys(res.data.user.newTypes) : [])
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

  // Set CSS variables from constants for desktop card styling
  useEffect(() => {
    const cardConstants = constants.components?.cards?.desktop;
    if (cardConstants) {
      const root = document.documentElement;
      root.style.setProperty('--desktop-card-height', cardConstants.height);
      root.style.setProperty('--desktop-card-font-size', cardConstants.fontSize);
      root.style.setProperty('--desktop-card-title-font-size', cardConstants.titleFontSize);
      root.style.setProperty('--desktop-card-year-font-size', cardConstants.yearFontSize);
      root.style.setProperty('--desktop-card-padding', cardConstants.padding);
      root.style.setProperty('--desktop-card-min-width', cardConstants.minWidth);
      root.style.setProperty('--desktop-card-max-width', cardConstants.maxWidth);
    }
  }, []);

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
  // Only clear if we're actually switching between different media types
  const [previousMediaType, setPreviousMediaType] = useState(null);
  useEffect(() => {
    if (setSelectedTags && previousMediaType && previousMediaType !== mediaType) {
      console.log('RestrictMediaType: Media type changed from', previousMediaType, 'to:', mediaType);
      setSelectedTags([]);
      // Clear tags from sessionStorage if it exists
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('selectedTags');
      }
    }
    setPreviousMediaType(mediaType);
  }, [mediaType, setSelectedTags, previousMediaType]);

  // Fetch media data if filteredData is empty and we're navigating to a media details page
  useEffect(() => {
    if (!isNaN(group) && (!filteredData || Object.keys(filteredData).length === 0)) {
      console.log('RestrictMediaType: Fetching media data for', mediaType, 'because filteredData is empty');
      console.log('RestrictMediaType: Valid media types:', mediaTypes);
      console.log('RestrictMediaType: Is mediaType valid?', mediaTypes.includes(mediaType));
      
      // Only fetch if mediaType is valid
      if (mediaTypes.includes(mediaType)) {
        // Fetch both collection and to-do data to get all media
        Promise.all([
          axios.get(constants['SERVER_URL'] + `/api/media/${mediaType}/collection`),
          axios.get(constants['SERVER_URL'] + `/api/media/${mediaType}/to-do`)
        ])
        .then(([collectionRes, toDoRes]) => {
          console.log('RestrictMediaType: Fetched collection data:', collectionRes.data);
          console.log('RestrictMediaType: Fetched to-do data:', toDoRes.data);
          
          // Combine both responses into filteredData format
          const combinedData = {
            S: [...(collectionRes.data.media || []).filter(m => m.tier === 'S'), ...(toDoRes.data.media || []).filter(m => m.tier === 'S')],
            A: [...(collectionRes.data.media || []).filter(m => m.tier === 'A'), ...(toDoRes.data.media || []).filter(m => m.tier === 'A')],
            B: [...(collectionRes.data.media || []).filter(m => m.tier === 'B'), ...(toDoRes.data.media || []).filter(m => m.tier === 'B')],
            C: [...(collectionRes.data.media || []).filter(m => m.tier === 'C'), ...(toDoRes.data.media || []).filter(m => m.tier === 'C')],
            D: [...(collectionRes.data.media || []).filter(m => m.tier === 'D'), ...(toDoRes.data.media || []).filter(m => m.tier === 'D')],
            F: [...(collectionRes.data.media || []).filter(m => m.tier === 'F'), ...(toDoRes.data.media || []).filter(m => m.tier === 'F')]
          };
          
          console.log('RestrictMediaType: Combined data:', combinedData);
          setFilteredData(combinedData);
        })
        .catch((err) => {
          console.log('RestrictMediaType: Error fetching media data:', err);
          console.log('RestrictMediaType: Error details:', err.response?.status, err.response?.data);
        });
      } else {
        console.log('RestrictMediaType: Invalid mediaType, not fetching data');
      }
    }
  }, [mediaType, group, filteredData, setFilteredData, mediaTypes]);

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
      console.log('RestrictMediaType: n=5, group=', group, 'isNaN(group)=', isNaN(group));
      if(!isNaN(group))
      {
        console.log('RestrictMediaType: Rendering ShowMediaDetails for group:', group);
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
      // Redirect to ShowMediaDetails since we now have inline editing
      return <Navigate to={`/${mediaType}/${group}`} replace />;
    }
  } else {
    console.log(n, group);
    console.log(mediaType, 'not valid type', mediaTypes);
    return <Navigate to="/404" />;
  }
}

export default App;