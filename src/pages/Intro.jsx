import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
const constants = require('../constants');

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
    <nav className={`navbar navbar-expand-md fixed-top transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`} 
         style={{ transition: 'all 0.3s ease', padding: isScrolled ? '0.5rem 1rem' : '1.5rem 1rem' }}>
      <div className="container">
        {/* Logo - Left */}
        <button className={`navbar-brand fw-bold ${isScrolled ? 'text-dark' : 'text-white'} btn btn-link text-decoration-none`} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
           style={{ fontSize: '1.5rem', padding: 0 }}>
          ME-DB
        </button>

        {/* Toggler for mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#introNavbar">
          <span className="navbar-toggler-icon" style={{ filter: isScrolled ? 'none' : 'invert(1)' }}></span>
        </button>

        {/* Center Links */}
        <div className="collapse navbar-collapse justify-content-center" id="introNavbar">
          <ul className="navbar-nav gap-4">
            {['About', 'Features', 'Use Cases', 'FAQ'].map((item) => (
              <li className="nav-item" key={item}>
                <button 
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className={`btn btn-link text-decoration-none fw-medium ${isScrolled ? 'text-secondary hover-primary' : 'text-white-50 hover-white'}`}
                  style={{ fontSize: '0.95rem' }}
                >
                  {item}
                </button>
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
          .hover-white:hover { color: #fff !important; }
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
    <div className="bg-white">
      <IntroNavbar />
      
      {/* 1. Hero / About Section */}
      <section id="about" className="d-flex align-items-center position-relative" 
               style={{ 
                 minHeight: '100vh', 
                 background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                 paddingTop: '80px'
               }}>
        <div className="container text-center text-white">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h1 className="display-2 fw-bold mb-4">ME-DB</h1>
              <p className="lead fs-3 mb-5 opacity-90 fw-light" style={{ lineHeight: '1.6' }}>
                A simple tier list app for tracking your collection and your to-do list, all in one.
                <br />
                <span className="opacity-75 fs-4">For anime, tv shows, movies, video games, and more!</span>
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <button onClick={google} className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold shadow">
                  Start Tracking Now
                </button>
              </div>

              <div className="mt-5 pt-5 opacity-50 small">
                SCROLL TO EXPLORE
                <div className="mt-2">↓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <Section id="features" className="bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Everything you need</h2>
            <p className="text-muted fs-5">Simple, powerful tools to manage your entertainment life.</p>
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
                <div className="card h-100 border-0 shadow-sm hover-lift transition-all">
                  <div className="card-body p-4 text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h3 className="h5 fw-bold mb-3">{feature.title}</h3>
                    <p className="text-muted mb-0">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Use Cases Section */}
      <Section id="use-cases" className="bg-white">
        <div className="container py-5">
          <div className="row align-items-center mb-5 pb-5">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5 bg-light rounded-3 text-center text-muted">
                [Placeholder for Screenshot: Tier List View]
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <h2 className="display-6 fw-bold mb-4">For the Completionist</h2>
              <p className="lead text-muted mb-4">
                You finish a game or a series, and you want to record it. Not just that you did it, but how good it was. ME-DB gives you a permanent record of your entertainment journey.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <span className="text-primary me-3">✓</span> Track completion dates
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <span className="text-primary me-3">✓</span> Rate with S-F tiers
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <span className="text-primary me-3">✓</span> Add personal notes
                </li>
              </ul>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="p-5 bg-light rounded-3 text-center text-muted">
                [Placeholder for Screenshot: To-Do List]
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="display-6 fw-bold mb-4">For the Planner</h2>
              <p className="lead text-muted mb-4">
                "We should watch that!" ...and then you forget. Add it to your ME-DB To-Do list immediately. Filter by genre, priority, or platform when you are ready to start something new.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. FAQ Section */}
      <Section id="faq" className="bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Frequently Asked Questions</h2>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion accordion-flush bg-white rounded shadow-sm" id="faqAccordion">
                {[
                  { q: 'Is ME-DB free?', a: 'Yes, ME-DB is completely free to use for all standard features.' },
                  { q: 'Can I import my data?', a: 'We are working on import tools for popular platforms. Currently you can add items manually.' },
                  { q: 'Is there a mobile app?', a: 'ME-DB is a Progressive Web App (PWA). You can add it to your home screen on iOS and Android for an app-like experience.' },
                  { q: 'Is my data private?', a: 'Your list is private by default. You can choose to share your profile if you wish.' }
                ].map((item, i) => (
                  <div className="accordion-item" key={i}>
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`}>
                        {item.q}
                      </button>
                    </h2>
                    <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body text-muted">
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
      
      {/* Footer Section - ensure bg-white to contrast with light FAQ section if needed, or keep seamless */}
      <div className="bg-dark">
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
