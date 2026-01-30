import React, { useState, useEffect, useRef } from 'react';
import Footer from '../Footer';
import collectionGif from '../img/collection-gif.gif';
import todoGif from '../img/todo-gif.gif';
const constants = require('../../app/constants');
const theme = require('../../styling/theme');

// Load Poppins font for landing page
const usePoppinsFont = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
};

// Hook for fade-up animation on scroll
const useFadeUp = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current; // Copy ref to variable for cleanup
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
};

// Animated wrapper component
const FadeUp = ({ children, delay = 0, className = '', style = {} }) => {
  const { ref, isVisible } = useFadeUp();
  
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const google = () => {
  window.open(constants['SERVER_URL'] + "/auth/google", "_self");
}

const IntroNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <nav className={`navbar navbar-expand-md fixed-top transition-all duration-300 ${isScrolled ? 'navbar-scrolled' : ''}`} 
         style={{ 
           transition: 'all 0.3s ease', 
           padding: isScrolled ? '0.5rem 1rem' : '1.5rem 1rem',
           backgroundColor: isScrolled ? '#ffffff' : 'transparent',
           boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
         }}>
      <div className="container">
        {/* Logo - Left */}
        <a className={`navbar-brand fw-bold d-flex align-items-center gap-2`} href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
           style={{ 
             fontSize: '1.5rem',
             color: isScrolled ? theme.components.introPage.navbar.textColorScrolled : theme.components.introPage.navbar.textColor
           }}>
          <img src="/favicon.ico" alt="ME-DB" style={{ width: '32px', height: '32px' }} />
          ME-DB
        </a>

        {/* Mobile Sign In Button - visible on mobile only */}
        <button 
          onClick={google}
          className={`btn ${isScrolled ? 'btn-dark' : 'btn-light'} rounded-pill px-3 fw-bold d-md-none`}
          style={{ fontSize: '0.85rem' }}
        >
          Sign In
        </button>

        {/* Toggler for mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#introNavbar">
          <span className="navbar-toggler-icon" style={{ filter: isScrolled ? 'none' : 'invert(1)' }}></span>
        </button>

        {/* Center Links */}
        <div className="collapse navbar-collapse justify-content-center" id="introNavbar">
          <ul className="navbar-nav gap-md-5" style={{ background: 'transparent' }}>
            {['About', 'Features', 'Why', 'FAQ'].map((item) => (
              <li className="nav-item" key={item}>
                <a 
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.toLowerCase().replace(' ', '-')); }}
                  className={`nav-link fw-medium transition-colors hover-opacity`}
                  style={{ 
                    fontSize: '0.95rem', 
                    cursor: 'pointer',
                    color: isScrolled ? theme.components.introPage.navbar.textColorScrolled : theme.components.introPage.navbar.textColor
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign In - Right */}
        <div className="d-none d-md-block">
          <button 
            onClick={google}
            className={`btn ${isScrolled ? 'btn-dark' : 'btn-light'} rounded-pill px-4 fw-bold`}
            style={{ fontSize: '0.9rem' }}
          >
            Sign In
          </button>
        </div>
      </div>
      <style>
        {`
          .hover-primary:hover { color: #0d6efd !important; }
          .hover-opacity:hover { opacity: 0.8; }
          .transition-colors { transition: color 0.2s ease; }
          
          /* Desktop navbar - transparent inner elements, center nav above hero */
          @media (min-width: 768px) {
            .navbar .container {
              position: relative;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              align-items: center;
            }
            #introNavbar {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
            }
            #introNavbar,
            #introNavbar *,
            .navbar-collapse,
            .navbar-nav,
            .nav-item,
            .nav-link {
              background-color: transparent !important;
              background: none !important;
              background-image: none !important;
              border: none !important;
              box-shadow: none !important;
              outline: none !important;
              -webkit-box-shadow: none !important;
            }
          }
          
          /* Mobile navbar: horizontal row with navy bg (same as hero) */
          @media (max-width: 767.98px) {
            #introNavbar {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background-color: #1D2144 !important;
              background: #1D2144 !important;
              padding: 0.75rem 1rem;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              z-index: 1030;
            }
            #introNavbar .navbar-nav {
              flex-direction: row !important;
              justify-content: center;
              flex-wrap: nowrap;
              gap: 0.5rem !important;
            }
            #introNavbar .nav-item {
              flex: 0 0 auto;
            }
            #introNavbar .nav-link {
              padding: 0.75rem 1rem !important;
              font-size: 0.9rem !important;
            }
            /* Mobile logo styling */
            .navbar-brand {
              font-size: 1.2rem !important;
            }
            .navbar-brand img {
              width: 24px !important;
              height: 24px !important;
            }
          }
          /* When navbar is scrolled (white background) - mobile only */
          @media (max-width: 767.98px) {
            .navbar-scrolled #introNavbar {
              background-color: #f8f9fa !important;
              border-top: 1px solid #e5e7eb;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
          }
        `}
      </style>
    </nav>
  );
};

const Section = ({ id, className, children, style }) => (
  <section id={id} className={className} style={{ paddingTop: '100px', paddingBottom: '100px', ...style }}>
    {children}
  </section>
);

const STANDARD_TYPES = [
  { icon: '🍥', label: 'Anime', path: '/demo/anime/collection' },
  { icon: '📺', label: 'TV Shows', path: '/demo/tv/collection' },
  { icon: '🎥', label: 'Movies', path: '/demo/movies/collection' },
  { icon: '🕹️', label: 'Video Games', path: '/demo/games/collection' }
];

const CUSTOM_TYPES_SETS = [
  [
    { icon: '✈️', label: 'Travel' },
    { icon: '📚', label: 'Books' },
    { icon: '🎨', label: 'Artists' },
    { icon: '🎵', label: 'Concerts' }
  ],
  [
    { icon: '🍽️', label: 'Cuisines' },
    { icon: '🍿', label: 'Snacks' },
    { icon: '🍷', label: 'Alcohol' },
    { icon: '🎁', label: 'Gifts' }
  ]
];

const AboutSection = () => {
  const [customSetIndex, setCustomSetIndex] = useState(0);
  const intervalRef = useRef(null);

  const advanceCarousel = (direction) => {
    setCustomSetIndex((prev) => (prev + direction + CUSTOM_TYPES_SETS.length) % CUSTOM_TYPES_SETS.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCustomSetIndex((prev) => (prev + 1) % CUSTOM_TYPES_SETS.length);
    }, 4000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCustomSetIndex((prev) => (prev + 1) % CUSTOM_TYPES_SETS.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Section id="about" style={{ backgroundColor: theme.components.introPage.aboutBg }}>
      <div className="container">
        <FadeUp>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>How It Works</h2>
            <p className="fs-4 d-none d-md-block" style={{ color: theme.components.introPage.text.secondary }}>
              (1) Create your media &nbsp;&nbsp; (2) Drag and drop into tiers &nbsp;&nbsp; (3) Search and filter!
            </p>
            <div className="d-md-none fs-5" style={{ color: theme.components.introPage.text.secondary }}>
              <p className="mb-2">(1) Create your media</p>
              <p className="mb-2">(2) Drag and drop into tiers</p>
              <p className="mb-0">(3) Search and filter!</p>
            </div>
          </div>
        </FadeUp>

        {/* Standard Types */}
        <FadeUp delay={100}>
          <p className="text-center fs-5 fw-semibold mb-3" style={{ color: theme.components.introPage.text.secondary }}>Standard Types</p>
          <div className="row justify-content-center g-4 mt-2">
            {STANDARD_TYPES.map((item, i) => (
              <div key={i} className="col-6 col-md-3 text-center">
                <div className="display-1 mb-3">{item.icon}</div>
                <p className="fs-5 fw-medium mb-3" style={{ color: theme.components.introPage.text.primary }}>{item.label}</p>
                <a
                  href={item.path}
                  className="btn btn-outline-light rounded-pill px-4"
                  style={{ fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  Try Demo
                </a>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Custom Types carousel */}
        <FadeUp delay={200}>
          <p className="text-center fs-5 fw-semibold mb-3 mt-5" style={{ color: theme.components.introPage.text.secondary }}>Custom Types</p>
          <div className="about-custom-carousel position-relative overflow-hidden d-flex align-items-center">
            <button
              type="button"
              className="about-carousel-btn position-absolute start-0 top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(255,255,255,0.15)', color: theme.components.introPage.text.primary, width: 40, height: 40, zIndex: 2 }}
              onClick={() => advanceCarousel(-1)}
              aria-label="Previous custom types"
            >
              ←
            </button>
            <div className="position-relative flex-grow-1" style={{ minWidth: 0 }}>
              {CUSTOM_TYPES_SETS.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className="row justify-content-center g-4 mt-2 position-absolute w-100 start-0 top-0"
                  style={{
                    opacity: customSetIndex === setIdx ? 1 : 0,
                    visibility: customSetIndex === setIdx ? 'visible' : 'hidden',
                    transform: `translateX(${customSetIndex === setIdx ? 0 : (setIdx < customSetIndex ? 30 : -30)}px)`,
                    transition: 'opacity 500ms ease, transform 500ms ease, visibility 500ms ease',
                    pointerEvents: customSetIndex === setIdx ? 'auto' : 'none',
                    zIndex: customSetIndex === setIdx ? 1 : 0
                  }}
                >
                  {set.map((item, i) => (
                    <div key={i} className="col-6 col-md-3 text-center about-custom-item">
                      <div className="about-custom-emoji mb-2">{item.icon}</div>
                      <p className="fs-5 fw-medium mb-0 text-nowrap about-custom-label">{item.label}</p>
                    </div>
                  ))}
                </div>
              ))}
              {/* Invisible spacer so container height = content (one slide); carousel expands to fit */}
              <div className="row justify-content-center g-4 mt-2 about-custom-spacer" aria-hidden>
                {CUSTOM_TYPES_SETS[0].map((item, i) => (
                  <div key={i} className="col-6 col-md-3 text-center">
                    <div className="about-custom-emoji mb-2">{item.icon}</div>
                    <p className="fs-5 fw-medium mb-0 text-nowrap about-custom-label">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="about-carousel-btn position-absolute end-0 top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(255,255,255,0.15)', color: theme.components.introPage.text.primary, width: 40, height: 40, zIndex: 2 }}
              onClick={() => advanceCarousel(1)}
              aria-label="Next custom types"
            >
              →
            </button>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
};

const Intro = () => {
  usePoppinsFont();
  
  return (
    <div style={{ backgroundColor: theme.components.introPage.heroBg, fontFamily: "'Poppins', sans-serif" }}>
      <IntroNavbar />
      
      {/* 1. Hero Section - Dark Navy */}
      <section id="hero" className="d-flex flex-column position-relative" 
               style={{ 
                 minHeight: '100vh', 
                 backgroundColor: theme.components.introPage.heroBg,
                 paddingTop: '80px'
               }}>
        {/* Main content - centered vertically */}
        <div className="container text-center flex-grow-1 d-flex align-items-center justify-content-center" style={{ color: theme.components.introPage.text.primary }}>
          <div className="row justify-content-center w-100 mx-0">
            <div className="col-lg-8 px-3">
              <FadeUp>
                <h1 style={{ color: theme.components.introPage.text.primary, marginBottom: '2rem' }}>
                  <span className="fw-bold d-block mb-2 display-5" style={{ color: '#e2e8f0' }}>Build your own</span>
                  <span className="fw-bold display-5" style={{ color: theme.colors.primary }}>Media Entertainment Database</span>
                </h1>
              </FadeUp>
              
              <FadeUp delay={150}>
                <div className="d-flex justify-content-center gap-3 mb-5">
                  <div className="google-btn" onClick={google}>
                    <div className="google-icon-wrapper">
                      <img className="google-icon" alt='Google logo' src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"/>
                    </div>
                    <span className="btn-text">Sign in with Google</span>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={300}>
                <div className="mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                  <p className="lead fs-5 mb-3" style={{ lineHeight: '1.6' }}>
                    <span className="d-none d-md-inline">
                      <span className="fw-bold">Tier lists</span> <span className="fw-normal">for your</span> <span className="fw-bold">Collection</span> <span className="fw-normal">and</span> <span className="fw-bold">To-Do List. All in one app.</span>
                    </span>
                    <span className="d-md-none">
                      <span className="fw-bold">Tier lists</span> <span className="fw-normal">for your</span><br />
                      <span className="fw-bold">Collection</span> <span className="fw-normal">and</span> <span className="fw-bold">To-Do List.</span><br />
                      <span className="fw-bold">All in one app.</span>
                    </span>
                  </p>
                  <p className="fs-5 mb-0" style={{ color: theme.components.introPage.text.muted }}>
                    Built for anime, tv shows, movies, video games, and more!
                  </p>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator - pinned to bottom */}
        <div style={{ marginTop: 'auto' }}>
          <FadeUp delay={450}>
            <div className="text-center pb-3 small" style={{ color: theme.components.introPage.text.accent }}>
              <div>SCROLL TO EXPLORE</div>
              <div className="mt-2">↓</div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 2. About Section - Darker Navy */}
      <AboutSection />

      {/* 3. Features Section - Light Gray Background */}
      <Section id="features" style={{ backgroundColor: theme.components.introPage.lightBg }}>
        <div className="container py-5">
          <FadeUp>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: theme.components.introPage.textLight.primary }}>Everything you need</h2>
              <p className="fs-5" style={{ color: theme.components.introPage.textLight.secondary }}>Simple, powerful tools to manage your entertainment life.</p>
            </div>
          </FadeUp>
          
          <div className="row g-4 pt-4 justify-content-center">
            {[
              { title: 'Tier Lists', icon: '📊', desc: 'Rank your favorites with tiered / grouped grading. Visualize your taste instantly.' },
              { title: 'Collection Tracking', icon: '📚', desc: 'Keep a comprehensive history of everything you have watched or played.' },
              { title: 'To-Do Lists', icon: '✅', desc: 'Never forget a recommendation again. Manage your backlog with ease.' },
              { title: 'Multi-Category', icon: '🎮', desc: 'Built for Anime, TV Shows, Movies, and Games out of the box.' },
              { title: 'Custom Types', icon: '✨', desc: 'Create your own categories for Books, Manga, Podcasts, or anything else.' },
              { title: 'Statistics', icon: '📈', desc: 'Get insights into your habits and ratings distribution.' }
            ].map((feature, i) => (
              <FadeUp key={i} delay={i * 100} className="col-md-4">
                <div className="card h-100 border-0 hover-lift transition-all" style={{
                  backgroundColor: theme.components.introPage.cardLight.background,
                  border: theme.components.introPage.cardLight.border,
                  boxShadow: theme.components.introPage.cardLight.shadow
                }}>
                  <div className="card-body p-4 text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h3 className="h5 fw-bold mb-3" style={{ color: theme.components.introPage.textLight.primary }}>{feature.title}</h3>
                    <p className="mb-0" style={{ color: theme.components.introPage.textLight.secondary }}>{feature.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Use Cases Section - Dark Navy Background */}
      <Section id="why" style={{ backgroundColor: theme.components.introPage.darkBg }}>
        <div className="container py-5">
          <div className="row align-items-center mb-5 pb-5">
            <FadeUp className="col-lg-6 order-lg-2" delay={150}>
              <div className="rounded-3 overflow-hidden" style={{
                backgroundColor: theme.components.introPage.cardDark.background,
                border: theme.components.introPage.cardDark.border
              }}>
                <img src={collectionGif} alt="Collection / tier list view" className="w-100" style={{ display: 'block' }} />
              </div>
            </FadeUp>
            <FadeUp className="col-lg-6 order-lg-1">
              <h2 className="display-6 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>For the Completionist</h2>
              <p className="lead mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                You finish a game or a series, and you want to record it. Not just that you did it, but how good it was. ME-DB gives you a permanent record of your entertainment journey.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="Favorites & ratings">⭐</span>
                  <span>Remember your Favorites & Least Favorites, your Top 10 & Bottom 10, your High 5 & Low 5, and your Most Memorable & Most Utterly Regretted</span>
                </li>
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="Have the answer">💬</span>
                  <span>When someone asks "How would you rate this?" - you'll have the answer</span>
                </li>
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="Remember & revisit">📚</span>
                  <span>If you ever wonder "What thing that I've already tried should I do/get/eat/drink again?" - you'll probably have the answer already, but in case you wanted to remember it, welcome to ME-DB!</span>
                </li>
              </ul>
            </FadeUp>
          </div>

          <div className="row align-items-center">
            <FadeUp className="col-lg-6">
              <div className="rounded-3 overflow-hidden" style={{
                backgroundColor: theme.components.introPage.cardDark.background,
                border: theme.components.introPage.cardDark.border
              }}>
                <img src={todoGif} alt="To-Do list view" className="w-100" style={{ display: 'block' }} />
              </div>
            </FadeUp>
            <FadeUp className="col-lg-6" delay={150}>
              <h2 className="display-6 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>For the Planner</h2>
              <p className="lead mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                "We should watch that!" ...and then you forget. Add it to your To-Do list immediately. Filter by genre, priority, or platform when you are ready to start something new.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="Lists">📋</span>
                  <span>Remember your Bucket List, Recommendations List, Wish List, List Of All Your Greatest Hopes & Dreams, and List Of Things You'd Never Ever Dare Try</span>
                </li>
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="Suggest next">💡</span>
                  <span>When someone asks "What should we try next?" - you'll have the answer</span>
                </li>
                <li className="mb-3 d-flex align-items-start" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3 flex-shrink-0" style={{ fontSize: '1.25rem' }} title="What to try next">🎯</span>
                  <span>If you ever wonder "What new thing should I do/get/eat/drink next?" - you'll probably have the answer already, but in case you wanted to remember it, welcome to ME-DB!</span>
                </li>
              </ul>
            </FadeUp>
          </div>
        </div>
      </Section>

      {/* 5. FAQ Section - Light Gray Background */}
      <Section id="faq" style={{ backgroundColor: theme.components.introPage.lightBg }}>
        <div className="container py-5">
          <FadeUp>
            <div className="text-center mb-5">
              <h2 className="fw-bold" style={{ color: theme.components.introPage.textLight.primary }}>Frequently Asked Questions</h2>
            </div>
          </FadeUp>
          
          <div className="row justify-content-center">
            <FadeUp className="col-lg-8" delay={150}>
              <div className="accordion accordion-flush rounded shadow-sm" id="faqAccordion" style={{
                backgroundColor: theme.components.introPage.accordionLight.background,
                overflow: 'hidden'
              }}>
                {[
                  { q: 'Is ME-DB free?', a: 'Yes, ME-DB is completely free to use for all features!' },
                  { q: 'Can I import my data?', a: 'No, but please reach out if you have a request! Currently you must add items manually.' },
                  { q: 'Is there a mobile app?', a: 'No, ME-DB is a web-only app. You can add it to your home screen on iOS by following this guide.' },
                  { q: 'Is my data private?', a: 'Your data is private by default. You can choose to make your profile and individual lists public if you wish.' }
                ].map((item, i) => (
                  <div className="accordion-item" key={i} style={{
                    backgroundColor: theme.components.introPage.accordionLight.itemBackground, 
                    borderColor: theme.components.introPage.accordionLight.border
                  }}>
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`} style={{
                        backgroundColor: theme.components.introPage.accordionLight.itemBackground,
                        color: theme.components.introPage.accordionLight.textColor
                      }}>
                        {item.q}
                      </button>
                    </h2>
                    <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body" style={{ color: theme.components.introPage.accordionLight.bodyColor }}>
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </Section>
      
      {/* Footer Section */}
      <div style={{ backgroundColor: theme.colors.background.dark }}>
        <Footer />
      </div>
      
      <style>
        {`
          .hover-lift:hover {
            transform: translateY(-5px);
          }
          .transition-all {
            transition: all 0.3s ease;
          }
          
          /* Hero section centering */
          #hero .container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #hero .row {
            margin-left: 0;
            margin-right: 0;
          }
          
          /* About section centering */
          #about .container {
            text-align: center;
          }
          #about .row {
            margin-left: auto;
            margin-right: auto;
          }
          /* Custom Types carousel: spacer reserves height so section expands to fit */
          .about-custom-carousel {
            min-height: 0;
            padding-left: 48px;
            padding-right: 48px;
          }
          .about-carousel-btn:hover {
            background: rgba(255,255,255,0.25) !important;
          }
          @media (max-width: 767.98px) {
            .about-custom-carousel {
              padding-left: 40px;
              padding-right: 40px;
            }
          }
          .about-custom-spacer {
            visibility: hidden;
            pointer-events: none;
          }
          .about-custom-emoji {
            font-size: 3rem;
            line-height: 1.2;
            overflow: visible;
          }
          @media (min-width: 768px) {
            .about-custom-emoji {
              font-size: 5rem;
            }
          }
          .about-custom-label {
            color: #e2e8f0 !important;
          }
          #about .about-custom-item {
            flex-shrink: 0;
          }
          #about .about-custom-emoji {
            flex-shrink: 0;
          }
          
          /* Features section centering */
          #features .container {
            text-align: center;
          }
          #features .row {
            margin-left: auto;
            margin-right: auto;
          }
          
          /* Why section - left aligned */
          #why .container {
            text-align: left;
          }
          #why .row {
            margin-left: auto;
            margin-right: auto;
            text-align: left;
          }
          
          /* FAQ section - left aligned */
          #faq .container {
            text-align: left;
          }
          #faq .row {
            margin-left: auto;
            margin-right: auto;
          }
          #faq .accordion {
            width: 100%;
          }
          #faq .accordion-button {
            text-align: left !important;
          }
          #faq .accordion-body {
            text-align: left !important;
          }
          
          /* Mobile styles */
          @media (max-width: 768px) {
            /* Global mobile centering */
            section .container {
              text-align: center;
            }
            section .row {
              margin-left: 0;
              margin-right: 0;
              justify-content: center !important;
            }
            section .col-6,
            section .col-md-3,
            section .col-md-4,
            section .col-lg-6,
            section .col-lg-8 {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            
            /* Hero section */
            #hero h1 {
              margin-top: 0.5rem !important;
            }
            #hero, #hero * {
              text-align: center;
            }
            #hero .google-btn {
              width: 260px !important;
              min-width: 260px !important;
              max-width: 260px !important;
              height: 52px !important;
              border-radius: 8px !important;
            }
            #hero .google-btn .google-icon-wrapper {
              width: 48px !important;
              height: 48px !important;
              left: 2px !important;
              top: 2px !important;
              border-radius: 6px !important;
            }
            #hero .google-btn .google-icon {
              width: 26px !important;
              height: 26px !important;
            }
            #hero .google-btn .btn-text {
              font-size: 16px !important;
              left: 55% !important;
            }
            #hero .mb-5 {
              margin-bottom: 3rem !important;
            }
            #hero .mb-4 {
              margin-top: 1rem !important;
              margin-bottom: 2rem !important;
            }
            
            /* About section demo cards */
            #about .row.g-4 {
              --bs-gutter-y: 0.75rem;
            }
            
            /* Why section - keep left aligned on mobile */
            #why .row {
              text-align: left !important;
            }
            #why .col-lg-6 {
              align-items: flex-start !important;
              text-align: left !important;
            }
            #why h2,
            #why p,
            #why ul,
            #why li {
              text-align: left !important;
            }
            
            /* FAQ section - keep accordion full width, left aligned */
            #faq .container {
              text-align: left !important;
            }
            #faq .col-lg-8 {
              width: 100% !important;
              max-width: 100% !important;
              padding-left: 0;
              padding-right: 0;
              text-align: left !important;
              align-items: flex-start !important;
            }
            #faq .accordion {
              width: 100% !important;
            }
            #faq .accordion-button,
            #faq .accordion-body {
              text-align: left !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Intro;
