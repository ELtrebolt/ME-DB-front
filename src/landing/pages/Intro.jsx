import React, { useState, useEffect, useRef } from 'react';
import Footer from '../Footer';
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
    <nav className={`navbar navbar-expand-md fixed-top transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : ''}`} 
         style={{ 
           transition: 'all 0.3s ease', 
           padding: isScrolled ? '0.5rem 1rem' : '1.5rem 1rem',
           backgroundColor: isScrolled ? theme.components.introPage.navbar.backgroundColorScrolled : theme.components.introPage.navbar.backgroundColor
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
          <ul className="navbar-nav gap-md-4">
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
          
          /* Mobile navbar: horizontal row instead of vertical dropdown */
          @media (max-width: 767.98px) {
            #introNavbar {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background-color: #1D2144;
              padding: 0.5rem 0.75rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            #introNavbar .navbar-nav {
              flex-direction: row !important;
              justify-content: center;
              flex-wrap: nowrap;
              gap: 0 !important;
            }
            #introNavbar .nav-item {
              flex: 0 0 auto;
            }
            #introNavbar .nav-link {
              padding: 0.25rem 0.5rem !important;
              font-size: 0.8rem !important;
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
          /* When navbar is scrolled (white background) */
          .navbar.bg-white #introNavbar {
            background-color: #ffffff !important;
            border-top: 1px solid #e5e7eb;
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

const Intro = () => {
  usePoppinsFont();
  
  return (
    <div style={{ backgroundColor: theme.components.introPage.heroBg, fontFamily: "'Poppins', sans-serif" }}>
      <IntroNavbar />
      
      {/* 1. Hero Section - Dark Navy */}
      <section id="hero" className="d-flex align-items-center position-relative" 
               style={{ 
                 minHeight: '100vh', 
                 backgroundColor: theme.components.introPage.heroBg,
                 paddingTop: '80px'
               }}>
        <div className="container text-center" style={{ color: theme.components.introPage.text.primary }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <FadeUp>
                <h1 style={{ color: theme.components.introPage.text.primary, marginBottom: '2rem', marginTop: '6rem' }}>
                  <span className="fw-bold d-block mb-2 display-5">Build your own</span>
                  <span className="fw-bold display-5 text-decoration-underline">Media Entertainment Database</span>
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
                  <p className="lead fs-5 fw-bold mb-3" style={{ lineHeight: '1.6' }}>
                    Tier lists for your Collection and your To-Do List. All in one.
                  </p>
                  <p className="fs-5 mb-0" style={{ color: theme.components.introPage.text.muted }}>
                    Built for anime, tv shows, movies, video games, and more!
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={450}>
                <div className="mt-5 pt-5 small" style={{ color: theme.components.introPage.text.accent }}>
                  SCROLL TO EXPLORE
                  <div className="mt-2">↓</div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Section - Darker Navy */}
      <Section id="about" style={{ backgroundColor: theme.components.introPage.aboutBg }}>
        <div className="container">
          <FadeUp>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>What is ME-DB?</h2>
              {/* Desktop: single line */}
              <p className="fs-4 d-none d-md-block" style={{ color: theme.components.introPage.text.secondary }}>
                (1) Create your media &nbsp;&nbsp; (2) Drag and drop into tiers &nbsp;&nbsp; (3) Search and filter!
              </p>
              {/* Mobile: separate lines */}
              <div className="d-md-none fs-5" style={{ color: theme.components.introPage.text.secondary }}>
                <p className="mb-2">(1) Create your media</p>
                <p className="mb-2">(2) Drag and drop into tiers</p>
                <p className="mb-0">(3) Search and filter!</p>
              </div>
            </div>
          </FadeUp>
          
          <FadeUp delay={150}>
            <div className="row justify-content-center g-4 mt-4">
              {[
                { icon: '🍥', label: 'Anime', path: '/demo/anime/collection' },
                { icon: '📺', label: 'TV Shows', path: '/demo/tv/collection' },
                { icon: '🎥', label: 'Movies', path: '/demo/movies/collection' },
                { icon: '🕹️', label: 'Video Games', path: '/demo/games/collection' }
              ].map((item, i) => (
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
        </div>
      </Section>

      {/* 3. Features Section - Light Gray Background */}
      <Section id="features" style={{ backgroundColor: theme.components.introPage.lightBg }}>
        <div className="container py-5">
          <FadeUp>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: theme.components.introPage.textLight.primary }}>Everything you need</h2>
              <p className="fs-5" style={{ color: theme.components.introPage.textLight.secondary }}>Simple, powerful tools to manage your entertainment life.</p>
            </div>
          </FadeUp>
          
          <div className="row g-4 pt-4">
            {[
              { title: 'Tier Lists', icon: '📊', desc: 'Rank your favorites with S-F tier grading. Visualize your taste instantly.' },
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
              <div className="p-5 rounded-3 text-center" style={{
                backgroundColor: theme.components.introPage.cardDark.background, 
                color: theme.components.introPage.text.secondary,
                border: theme.components.introPage.cardDark.border
              }}>
                [Placeholder for Screenshot: Tier List View]
              </div>
            </FadeUp>
            <FadeUp className="col-lg-6 order-lg-1">
              <h2 className="display-6 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>For the Completionist</h2>
              <p className="lead mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                You finish a game or a series, and you want to record it. Not just that you did it, but how good it was. ME-DB gives you a permanent record of your entertainment journey.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3" style={{ color: theme.colors.primary }}>✓</span> Track completion dates
                </li>
                <li className="mb-3 d-flex align-items-center" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3" style={{ color: theme.colors.primary }}>✓</span> Rate with S-F tiers
                </li>
                <li className="mb-3 d-flex align-items-center" style={{ color: theme.components.introPage.text.secondary }}>
                  <span className="me-3" style={{ color: theme.colors.primary }}>✓</span> Add personal notes
                </li>
              </ul>
            </FadeUp>
          </div>

          <div className="row align-items-center">
            <FadeUp className="col-lg-6">
              <div className="p-5 rounded-3 text-center" style={{
                backgroundColor: theme.components.introPage.cardDark.background, 
                color: theme.components.introPage.text.secondary,
                border: theme.components.introPage.cardDark.border
              }}>
                [Placeholder for Screenshot: To-Do List]
              </div>
            </FadeUp>
            <FadeUp className="col-lg-6" delay={150}>
              <h2 className="display-6 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>For the Planner</h2>
              <p className="lead mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                "We should watch that!" ...and then you forget. Add it to your ME-DB To-Do list immediately. Filter by genre, priority, or platform when you are ready to start something new.
              </p>
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
                  { q: 'Is ME-DB free?', a: 'Yes, ME-DB is completely free to use for all standard features.' },
                  { q: 'Can I import my data?', a: 'We are working on import tools for popular platforms. Currently you can add items manually.' },
                  { q: 'Is there a mobile app?', a: 'No, ME-DB is a web-only app. You can add it to your home screen on iOS and Android for an app-like experience.' },
                  { q: 'Is my data private?', a: 'Your data is private by default. You can choose to make individual lists public if you wish.' }
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
          
          /* Mobile styles for hero section */
          @media (max-width: 768px) {
            /* Move title higher */
            #hero h1 {
              margin-top: 0.5rem !important;
            }
            
            /* Ensure text centering */
            #hero, #hero * {
              text-align: center;
            }
            
            /* Make Google sign-in button bigger */
            #hero .google-btn {
              padding: 14px 24px !important;
              font-size: 1.1rem !important;
            }
            #hero .google-btn .google-icon-wrapper {
              width: 40px !important;
              height: 40px !important;
            }
            #hero .google-btn .google-icon {
              width: 24px !important;
              height: 24px !important;
            }
            #hero .google-btn .btn-text {
              font-size: 1.1rem !important;
            }
            
            /* Move subtitles lower - more space after Google button */
            #hero .mb-5 {
              margin-bottom: 4rem !important;
            }
            #hero .mb-4 {
              margin-bottom: 2rem !important;
            }
            #hero .mt-5.pt-5 {
              margin-top: 3rem !important;
              padding-top: 2rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Intro;
