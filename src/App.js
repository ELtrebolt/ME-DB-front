import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { api as axios } from './app/api';
import { toast } from 'sonner';
// Components
import Navbar from "./app/Navbar";
// Pages — kept in main bundle (used on every public route)

import About from "./landing/pages/About";
import Privacy from "./landing/pages/Privacy";
import Terms from "./landing/pages/Terms";
import NotFound from "./landing/pages/NotFound";
import Logout from "./app/pages/Logout";
// Demo Components — lazy-loaded (only needed on /demo routes and unauthenticated public pages)
const DemoNavbar = lazy(() => import('./demo/components/DemoNavbar'));
const DemoBanner = lazy(() => import('./demo/components/DemoBanner'));
// Lazy-loaded pages — excluded from main bundle
const ShowMediaList = lazy(() => import('./app/pages/ShowMediaList'));
const Stats = lazy(() => import('./app/pages/Stats'));
const Admin = lazy(() => import('./admin/Admin'));
const Intro = lazy(() => import('./landing/pages/Intro'));
const Profile = lazy(() => import('./app/pages/Profile'));
const ShowMediaDetails = lazy(() => import('./app/pages/ShowMediaDetails'));
const CreateMedia = lazy(() => import('./app/pages/CreateMedia'));
const Friends = lazy(() => import('./app/pages/Friends'));
const SharedView = lazy(() => import('./app/pages/SharedView'));
const SharedMediaDetails = lazy(() => import('./app/pages/SharedMediaDetails'));
const DemoStats = lazy(() => import('./demo/pages/DemoStats'));
const DemoShowMediaList = lazy(() => import('./demo/pages/DemoShowMediaList'));
const DemoShowMediaDetails = lazy(() => import('./demo/pages/DemoShowMediaDetails'));
const DemoCreateMedia = lazy(() => import('./demo/pages/DemoCreateMedia'));
const constants = require('./app/constants');
const theme = require('./styling/theme');

const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userChanged, setUserChanged] = useState(false);
  const [newTypes, setNewTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tagValues = params.getAll('tag');
    if (tagValues.length > 0) {
      return tagValues.map(label => ({ label, value: label }));
    }
    // Legacy fallback: comma-joined 'tags' param
    const legacyTags = params.get('tags');
    if (legacyTags) {
      return legacyTags.split(',').map(label => ({ label, value: label }));
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

  // Preload ShowMediaList chunk as soon as the user is confirmed logged in
  useEffect(() => {
    if (user) {
      import('./app/pages/ShowMediaList');
    }
  }, [user]);

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
      <HelmetProvider>
        <Router>
          <AppContent user={user} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData} />
        </Router>
      </HelmetProvider>
    );
  }
};

function isListRoutePath(path) {
  const parts = String(path || '').split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return parts[1] === 'collection' || parts[1] === 'to-do';
}

// Separate component to access useLocation inside Router
function AppContent({ user, setUserChanged, newTypes, selectedTags, setSelectedTags, filteredData, setFilteredData }) {
  const location = useLocation();
  const isDemoRoute = location.pathname.startsWith('/demo');
  const isPublicPage = ['/about'].includes(location.pathname);

  const getLastListPathKey = useCallback(() => {
    const id = user?.username || user?.email || 'unknown_user';
    return `me-db:lastListPath:${id}`;
  }, [user?.username, user?.email]);

  const getEffectiveHomePath = () => {
    const homePage = user?.customizations?.homePage;
    if (homePage) return `/${homePage}`;

    // Only restore list pages (/:mediaType/collection or /:mediaType/to-do)
    try {
      const saved = localStorage.getItem(getLastListPathKey());
      if (saved && isListRoutePath(saved)) return saved;
    } catch (_) {
      // ignore storage errors; we fall back below
    }

    return '/anime/collection';
  };

  // Persist last opened list route so the next app open returns to where user left off
  useEffect(() => {
    if (!user) return;
    if (!isListRoutePath(location.pathname)) return;
    try {
      localStorage.setItem(getLastListPathKey(), location.pathname);
    } catch (_) {
      // ignore storage errors
    }
  }, [user, location.pathname, getLastListPathKey]);
  
  // Determine which navbar to show:
  // - Demo routes: DemoNavbar (without sign-in, handled by DemoLayout)
  // - Logged in (non-demo): Normal Navbar
  // - Not logged in on public pages (about, privacy, terms): DemoNavbar with sign-in
  // - Landing page: No navbar (IntroNavbar is part of Intro component)
  const showNormalNavbar = user && !isDemoRoute;
  const showDemoNavbarWithSignIn = !user && isPublicPage && !isDemoRoute;
  
  return (
    <div>
      {showNormalNavbar && (
        <Navbar user={user} setUserChanged={setUserChanged} newTypes={newTypes} isAdmin={ADMIN_EMAILS.includes(user?.email)}/>
      )}
      {showDemoNavbarWithSignIn && (
        <Suspense fallback={null}>
          <DemoNavbar user={user} />
        </Suspense>
      )}
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}><div className="spinner-border text-secondary" role="status" /></div>}>
      <Routes>
            <Route path='/' element={user ? <Navigate to={getEffectiveHomePath()} /> : <Intro />} />
            <Route path='/about' element={<About/>} />
            <Route path='/privacy' element={<Privacy/>} />
            <Route path='/terms' element={<Terms/>} />
            <Route path='/stats' element={user ? <Stats user={user}/> : <Navigate to="/"/>} />
            <Route path='/profile' element={user ? <Profile user={user} setUserChanged={setUserChanged}/> : <Navigate to="/"/>} />
            <Route path='/friends' element={user ? <Friends user={user} setUserChanged={setUserChanged}/> : <Navigate to="/"/>} />
            <Route path='/admin' element={user && ADMIN_EMAILS.includes(user.email) ? <Admin user={user}/> : <Navigate to="/"/>} />
            <Route path='/user/:username' element={<Profile />} />
            <Route path='/user/:username/:mediaType' element={<SharedView />} />
            <Route path='/user/:username/:mediaType/:id' element={<SharedMediaDetails />} />
            <Route path='/logout' element={<Logout/>} />

            <Route path='/:mediaType/collection/create' element={<RestrictMediaType user={user} n={3} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>} />
            <Route path='/:mediaType/to-do/create' element={<RestrictMediaType user={user} n={4} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>} />

            <Route path='/:mediaType' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>} />
            <Route path='/:mediaType/:group' element={<RestrictMediaType user={user} n={5} setUserChanged={setUserChanged} newTypes={newTypes} selectedTags={selectedTags} setSelectedTags={setSelectedTags} filteredData={filteredData} setFilteredData={setFilteredData}/>} />
            <Route path='/:mediaType/:id/edit' element={<RestrictMediaType user={user} n={6} setUserChanged={setUserChanged} newTypes={newTypes}/>} />
            
            {/* Demo Routes - No authentication required */}
            <Route path='/demo' element={<Navigate to="/demo/anime/collection" />} />
            <Route path='/demo/stats' element={<DemoLayout user={user}><DemoStats /></DemoLayout>} />
            <Route path='/demo/:mediaType' element={<DemoLayout user={user}><DemoRouteHandler /></DemoLayout>} />
            <Route path='/demo/:mediaType/collection' element={<DemoLayout user={user}><DemoShowMediaList toDo={false} /></DemoLayout>} />
            <Route path='/demo/:mediaType/to-do' element={<DemoLayout user={user}><DemoShowMediaList toDo={true} /></DemoLayout>} />
            <Route path='/demo/:mediaType/collection/create' element={<DemoLayout user={user}><DemoCreateMedia toDo={false} /></DemoLayout>} />
            <Route path='/demo/:mediaType/to-do/create' element={<DemoLayout user={user}><DemoCreateMedia toDo={true} /></DemoLayout>} />
            <Route path='/demo/:mediaType/:group' element={<DemoLayout user={user}><DemoDetailRouteHandler /></DemoLayout>} />
            
            <Route path='/404' element={<NotFound/>} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
      </Suspense>
        </div>
  );
}

function RestrictMediaType({ user, n, setUserChanged, newTypes, selectedTags, setSelectedTags, filteredData, setFilteredData}) {
  const { mediaType, group } = useParams();
  const location = useLocation();
  const newType = newTypes.includes(mediaType);
  const defaultTypes = useMemo(() => constants.STANDARD_MEDIA_TYPES, []);
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
    const tagValues = urlParams.getAll('tag');
    const legacyTagsParam = urlParams.get('tags');
    const tagLabels = tagValues.length > 0
      ? tagValues
      : (legacyTagsParam ? legacyTagsParam.split(',').map(s => s.trim()).filter(Boolean) : []);

    if (tagLabels.length > 0) {
      // URL has tags - set them (this is a navigation event)
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
          toast.error('Could not load media. Please try again.');
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

// Check if localStorage is available
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Demo Layout Component - Wraps demo pages with DemoNavbar and DemoBanner
function DemoLayout({ children, user }) {
  const storageAvailable = isLocalStorageAvailable();
  
  return (
    <>
      <DemoNavbar user={user} />
      <DemoBanner storageAvailable={storageAvailable} />
      {children}
    </>
  );
}

// Demo Route Handler - Handles /demo/:mediaType route
function DemoRouteHandler() {
  const { mediaType } = useParams();
  const validTypes = constants.STANDARD_MEDIA_TYPES;
  
  if (validTypes.includes(mediaType)) {
    return <Navigate to={`/demo/${mediaType}/collection`} replace />;
  }
  return <Navigate to="/404" />;
}

// Demo Detail Route Handler - Handles /demo/:mediaType/:group where group could be ID or "collection"/"to-do"
function DemoDetailRouteHandler() {
  const { mediaType, group } = useParams();
  const validTypes = constants.STANDARD_MEDIA_TYPES;
  
  if (!validTypes.includes(mediaType)) {
    return <Navigate to="/404" />;
  }
  
  // If group is a valid ID (e.g. numeric like 1 or 50), show details
  // Otherwise redirect to 404
  if (group && group !== 'collection' && group !== 'to-do') {
    return <DemoShowMediaDetails />;
  }
  
  return <Navigate to="/404" />;
}

export default App;
