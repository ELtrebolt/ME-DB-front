import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useLocation } from 'react-router-dom';

// Components
import Navbar from "./app/Navbar";
// Pages
import CreateMedia from './app/pages/CreateMedia';
import ShowMediaList from './app/pages/ShowMediaList';
import ShowMediaDetails from './app/pages/ShowMediaDetails';
import SharedView from './app/pages/SharedView';
import About from "./landing/pages/About";
import Intro from "./landing/pages/Intro";
import Privacy from "./landing/pages/Privacy";
import Terms from "./landing/pages/Terms";
import NotFound from "./landing/pages/NotFound";
import Logout from "./app/pages/Logout";
import Stats from './app/pages/Stats';
import Profile from './app/pages/Profile';
import Friends from './app/pages/Friends';
// Other
import { useEffect, useState, useMemo, useRef } from "react";
import axios from 'axios';
const constants = require('./app/constants');
const theme = require('./styling/theme');

const App = () => {
  axios.defaults.withCredentials = true;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userChanged, setUserChanged] = useState(false);
  const [newTypes, setNewTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get('tags');
    if (tagsParam) {
      return tagsParam.split(',').map(label => ({ label, value: label }));
    }
    return [];
  });
  const [filteredData, setFilteredData] = useState({});

  useEffect(() => {
    // get User data from MongoDB
    const getUser = async () => {
      if(!user || userChanged)
      {
        axios
        .get(constants['SERVER_URL'] + '/auth/login/success', {withCredentials: true})
        .then((res) => {
          setUser(res.data.user);
          const types = res.data.user?.newTypes;
          setNewTypes(Array.isArray(types) ? types : (types ? Object.keys(types) : []));
          setUserChanged(false);
        })
        .catch((err) => {
          if (err.response?.status && err.response.status !== 401 && err.response.status !== 403) {
            console.error('Auth error:', err.response?.status, err.response?.data);
          }
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
      }
    };
    getUser();
  }, [user, userChanged]);

  // Set CSS variables from theme
  useEffect(() => {
    const cardConstants = theme.components?.cards?.desktop;
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

  // Session refresh
  useEffect(() => {
    if (user) {
      const sessionRefreshInterval = setInterval(() => {
        axios
          .get(constants['SERVER_URL'] + '/auth/login/success', {withCredentials: true})
          .then((res) => {
            if (!res.data.success) {
              setUser(null);
            }
          })
          .catch(() => {
            setUser(null);
          });
      }, 30 * 60 * 1000);

      return () => clearInterval(sessionRefreshInterval);
    }
  }, [user]);
  
  if(!isLoading)
  {
    return (
      <Router>
        <div>
          {user ? (
            <Navbar user={user} setUserChanged={setUserChanged} newTypes={newTypes}/>
          ) : null}
          <Routes>
            <Route path='/' element={user ? <Navigate to={user.customizations?.homePage ? `/${user.customizations.homePage}` : "/anime/collection"}/> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/privacy' element={<Privacy/>} />
            <Route path='/terms' element={<Terms/>} />
            <Route path='/stats' element={user ? <Stats user={user}/> : <Navigate to="/"/>} />
            <Route path='/profile' element={user ? <Profile user={user} setUserChanged={setUserChanged}/> : <Navigate to="/"/>} />
            <Route path='/friends' element={user ? <Friends user={user} setUserChanged={setUserChanged}/> : <Navigate to="/"/>} />
            <Route path='/user/:username' element={<Profile />} />
            <Route path='/user/:username/:mediaType' element={<SharedView />} />
            <Route path='/logout' element={<Logout/>} />
            <Route path='/shared/:token' element={<SharedView/>} />

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
  const { mediaType, group } = useParams();
  const location = useLocation();
  const newType = newTypes.includes(mediaType);
  const defaultTypes = useMemo(() => ['anime', 'tv', 'movies', 'games'], []);
  const mediaTypes = useMemo(() => newTypes.length > 0 ? [...defaultTypes, ...newTypes] : defaultTypes, [newTypes, defaultTypes]);

  // Use ref to track previous URL search to detect actual URL navigation
  const prevSearchRef = useRef(location.search);

  // Read tags from URL parameters - only when URL actually changes (navigation)
  useEffect(() => {
    if (!setSelectedTags) return;
    
    // Only process if URL search actually changed (not just state change)
    const prevSearch = prevSearchRef.current;
    if (prevSearch === location.search) return;
    prevSearchRef.current = location.search;

    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    
    if (tagsParam) {
      // URL has tags - set them (this is a navigation event)
      const tagLabels = tagsParam.split(',');
      setSelectedTags(tagLabels.map(label => ({ label, value: label })));
    } else {
      // URL has no tags - only clear if we actually navigated away
      const pathParts = location.pathname.split('/');
      if (pathParts.length <= 3) {
        setSelectedTags([]);
      }
    }
  }, [location.search, location.pathname, setSelectedTags]);

  // Clear tags when media type changes
  const [previousMediaType, setPreviousMediaType] = useState(null);
  useEffect(() => {
    if (setSelectedTags && previousMediaType && previousMediaType !== mediaType) {
      setSelectedTags([]);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('selectedTags');
      }
    }
    setPreviousMediaType(mediaType);
  }, [mediaType, setSelectedTags, previousMediaType]);

  // Fetch media data for details page
  useEffect(() => {
    if (!isNaN(group) && (!filteredData || Object.keys(filteredData).length === 0)) {
      if (mediaTypes.includes(mediaType)) {
        Promise.all([
          axios.get(constants['SERVER_URL'] + `/api/media/${mediaType}/collection`),
          axios.get(constants['SERVER_URL'] + `/api/media/${mediaType}/to-do`)
        ])
        .then(([collectionRes, toDoRes]) => {
          const combinedData = {
            S: [...(collectionRes.data.media || []).filter(m => m.tier === 'S'), ...(toDoRes.data.media || []).filter(m => m.tier === 'S')],
            A: [...(collectionRes.data.media || []).filter(m => m.tier === 'A'), ...(toDoRes.data.media || []).filter(m => m.tier === 'A')],
            B: [...(collectionRes.data.media || []).filter(m => m.tier === 'B'), ...(toDoRes.data.media || []).filter(m => m.tier === 'B')],
            C: [...(collectionRes.data.media || []).filter(m => m.tier === 'C'), ...(toDoRes.data.media || []).filter(m => m.tier === 'C')],
            D: [...(collectionRes.data.media || []).filter(m => m.tier === 'D'), ...(toDoRes.data.media || []).filter(m => m.tier === 'D')],
            F: [...(collectionRes.data.media || []).filter(m => m.tier === 'F'), ...(toDoRes.data.media || []).filter(m => m.tier === 'F')]
          };
          setFilteredData(combinedData);
        })
        .catch((err) => {
          console.error('Error fetching media data:', err.response?.status, err.message);
        });
      }
    }
  }, [mediaType, group, filteredData, setFilteredData, mediaTypes]);

  if (mediaTypes.includes(mediaType)) {
    if(n === 3) return <CreateMedia user={user} toDo={false} newType={newType} selectedTags={selectedTags}/>;
    if(n === 4) return <CreateMedia user={user} toDo={true} newType={newType} selectedTags={selectedTags}/>;
    if(n === 5) {
      if(!isNaN(group)) return <ShowMediaDetails user={user} newType={newType} filteredData={filteredData}/>;
      if(group === "collection" || group === undefined) return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={false} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>;
      if(group === "to-do") return <ShowMediaList user={user} setUserChanged={setUserChanged} toDo={true} newType={newType} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>;
      return <Navigate to="/404" />;
    }
    if(n === 6) return <Navigate to={`/${mediaType}/${group}`} replace />;
  }
  return <Navigate to="/404" />;
}

export default App;
