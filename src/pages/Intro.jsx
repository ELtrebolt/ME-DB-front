import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
const constants = require('../constants');
const theme = require('../theme');

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
        <a className={`navbar-brand fw-bold`} href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
           style={{ 
             fontSize: '1.5rem',
             color: isScrolled ? theme.components.introPage.navbar.textColorScrolled : theme.components.introPage.navbar.textColor
           }}>
          ME-DB
        </a>

        {/* Toggler for mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#introNavbar">
          <span className="navbar-toggler-icon" style={{ filter: isScrolled ? 'none' : 'invert(1)' }}></span>
        </button>

        {/* Center Links */}
        <div className="collapse navbar-collapse justify-content-center" id="introNavbar">
          <ul className="navbar-nav gap-4">
            {['About', 'Features', 'Use Cases', 'FAQ'].map((item) => (
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
        `}
      </style>
    </nav>
  );
};

const Section = ({ id, className, children, style }) => (
  <section id={id} className={`py-5 ${className}`} style={style}>
    {children}
  </section>
);

const Intro = () => {
  return (
    <div style={{ backgroundColor: theme.components.introPage.bg1 }}>
      <IntroNavbar />
      
      {/* 1. Hero / About Section */}
      <section id="about" className="d-flex align-items-center position-relative" 
               style={{ 
                 minHeight: '100vh', 
                 backgroundColor: theme.components.introPage.bg1,
                 paddingTop: '80px'
               }}>
        <div className="container text-center" style={{ color: theme.components.introPage.text.primary }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <br></br>
              <h1 className="mb-4" style={{ color: theme.components.introPage.text.primary }}>
                <span className="fw-bold d-block mb-2 fs-3">Welcome to your</span>
                <span className="fst-italic display-5 fw-bold text-nowrap">Media Entertainment DataBase</span>
              </h1>
              <p className="lead fs-6 mb-5 fw-light" style={{ 
                lineHeight: '1.6',
                color: theme.components.introPage.text.secondary
              }}>
                A simple <span className="fw-bold">tier list</span> app for tracking your <span className="fw-bold">collection</span> and your <span className="fw-bold">to-do list</span>, <span className="text-decoration-underline">all in one</span>.
                <br />
                <span style={{ color: theme.components.introPage.text.muted }}>
                  Built for <span className="fw-bold" style={{ color: theme.colors.accent.anime }}>anime</span>, <span className="fw-bold" style={{ color: theme.colors.accent.tv }}>tv shows</span>, <span className="fw-bold" style={{ color: theme.colors.accent.movies }}>movies</span>, <span className="fw-bold" style={{ color: theme.colors.accent.games }}>video games</span>, and more!
                </span>
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <div className="google-btn" onClick={google}>
                  <div className="google-icon-wrapper">
                    <img className="google-icon" alt='Google logo' src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"/>
                  </div>
                  <span className="btn-text">Sign in with Google</span>
                </div>
              </div>

              <div className="mt-5 pt-5 small" style={{ color: theme.components.introPage.text.accent }}>
                SCROLL TO EXPLORE
                <div className="mt-2">↓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <Section id="features" style={{ backgroundColor: theme.components.introPage.bg2 }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: theme.components.introPage.text.primary }}>Everything you need</h2>
            <p className="fs-5" style={{ color: theme.components.introPage.text.secondary }}>Simple, powerful tools to manage your entertainment life.</p>
          </div>
          
          <div className="row g-4 pt-4">
            {[
              { title: 'Tier Lists', icon: '📊', desc: 'Rank your favorites with S-F tier grading. Visualize your taste instantly.' },
              { title: 'Collection Tracking', icon: '📚', desc: 'Keep a comprehensive history of everything you have watched or played.' },
              { title: 'To-Do Lists', icon: '✅', desc: 'Never forget a recommendation again. Manage your backlog with ease.' },
              { title: 'Multi-Category', icon: '🎮', desc: 'Built for Anime, TV Shows, Movies, and Games out of the box.' },
              { title: 'Custom Types', icon: '✨', desc: 'Create your own categories for Books, Manga, Podcasts, or anything else.' },
              { title: 'Statistics', icon: '📈', desc: 'Get insights into your habits and ratings distribution.' }
            ].map((feature, i) => (
              <div className="col-md-4" key={i}>
                <div className="card h-100 border-0 shadow-sm hover-lift transition-all" style={{
                  backgroundColor: theme.components.introPage.cardGlass, 
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.components.introPage.cardBorder}`
                }}>
                  <div className="card-body p-4 text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h3 className="h5 fw-bold mb-3" style={{ color: theme.components.introPage.text.primary }}>{feature.title}</h3>
                    <p className="mb-0" style={{ color: theme.components.introPage.text.secondary }}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Use Cases Section */}
      <Section id="use-cases" style={{ backgroundColor: theme.components.introPage.bg1 }}>
        <div className="container py-5">
          <div className="row align-items-center mb-5 pb-5">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5 rounded-3 text-center" style={{
                backgroundColor: theme.components.introPage.cardGlass, 
                color: theme.components.introPage.text.secondary,
                border: `1px solid ${theme.components.introPage.cardBorder}`
              }}>
                [Placeholder for Screenshot: Tier List View]
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
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
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="p-5 rounded-3 text-center" style={{
                backgroundColor: theme.components.introPage.cardGlass, 
                color: theme.components.introPage.text.secondary,
                border: `1px solid ${theme.components.introPage.cardBorder}`
              }}>
                [Placeholder for Screenshot: To-Do List]
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="display-6 fw-bold mb-4" style={{ color: theme.components.introPage.text.primary }}>For the Planner</h2>
              <p className="lead mb-4" style={{ color: theme.components.introPage.text.secondary }}>
                "We should watch that!" ...and then you forget. Add it to your ME-DB To-Do list immediately. Filter by genre, priority, or platform when you are ready to start something new.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. FAQ Section */}
      <Section id="faq" style={{ backgroundColor: theme.components.introPage.bg2 }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: theme.components.introPage.text.primary }}>Frequently Asked Questions</h2>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion accordion-flush rounded shadow-sm" id="faqAccordion" style={{
                backgroundColor: theme.components.introPage.accordionBackground
              }}>
                {[
                  { q: 'Is ME-DB free?', a: 'Yes, ME-DB is completely free to use for all standard features.' },
                  { q: 'Can I import my data?', a: 'We are working on import tools for popular platforms. Currently you can add items manually.' },
                  { q: 'Is there a mobile app?', a: 'No, ME-DB is a web-only app. You can add it to your home screen on iOS and Android for an app-like experience.' },
                  { q: 'Is my data private?', a: 'Your data is private by default. You can choose to make individual lists public if you wish.' }
                ].map((item, i) => (
                  <div className="accordion-item" key={i} style={{
                    backgroundColor: theme.components.introPage.accordionItemBackground, 
                    borderColor: theme.components.introPage.accordionBorder
                  }}>
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`} style={{
                        backgroundColor: theme.components.introPage.accordionItemBackground,
                        color: theme.components.introPage.text.primary
                      }}>
                        {item.q}
                      </button>
                    </h2>
                    <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body" style={{ color: theme.components.introPage.text.secondary }}>
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
        `}
      </style>
    </div>
  );
};

export default Intro;
