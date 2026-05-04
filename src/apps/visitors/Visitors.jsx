import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VisitorsHero from './VisitorsHero';
import JourneyTimeline from './JourneyTimeline';
import BuiltShowcase from './BuiltShowcase';
import TechStack from './TechStack';
import LessonsLearned from './LessonsLearned';
import ContactSection from './ContactSection';
import AIAndPeople from './AIAndPeople';
import './Visitors.css';

const SECTIONS = [
  { id: 'journey', label: 'Journey' },
  { id: 'ai-people', label: 'AI & People' },
  { id: 'built', label: "What I've Built" },
  { id: 'stack', label: 'Stack' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'contact', label: 'Contact' },
 
];

function Visitors() {
  const [activeSection, setActiveSection] = useState('journey');
  const sectionRefs = useRef({});

  // Track which section is currently in view for sticky nav highlighting
  useEffect(function setupScrollSpy() {
    const observer = new IntersectionObserver(
      function handleIntersect(entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
      }
    );

    SECTIONS.forEach(function (section) {
      const el = document.getElementById(section.id);
      if (el) {
        sectionRefs.current[section.id] = el;
        observer.observe(el);
      }
    });

    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  // Fade-in on scroll for any element with .visitors-reveal
  useEffect(function setupRevealObserver() {
    const revealObserver = new IntersectionObserver(
      function handleReveal(entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visitors-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.visitors-reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    return function cleanup() {
      revealObserver.disconnect();
    };
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -80; // account for sticky nav height
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  return (
    <div className="visitors-page">
      <div className="visitors-back-row">
        <Link to="/" className="visitors-back-link">← Back to apps</Link>
      </div>

      <VisitorsHero onJumpToContact={function () { scrollToSection('contact'); }} />

      <nav className="visitors-subnav" aria-label="Section navigation">
        <div className="visitors-subnav-inner">
          {SECTIONS.map(function (section) {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                className={'visitors-subnav-btn' + (isActive ? ' active' : '')}
                onClick={function () { scrollToSection(section.id); }}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="visitors-sections">
        <section id="journey" className="visitors-section visitors-reveal">
          <JourneyTimeline />
        </section>

        <section id="ai-people" className="visitors-section visitors reveal">
          <AIAndPeople />
        </section>

        <section id="built" className="visitors-section visitors-reveal">
          <BuiltShowcase />
        </section>

        <section id="stack" className="visitors-section visitors-reveal">
          <TechStack />
        </section>

        <section id="lessons" className="visitors-section visitors-reveal">
          <LessonsLearned />
        </section>

        <section id="contact" className="visitors-section visitors-reveal">
          <ContactSection />
        </section>
      </div>

      <footer className="visitors-footer">
        <p>Built with React, Vite, and Supabase. Source on <a href="https://github.com/mrbrianmoon/life-workflow" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </footer>
    </div>
  );
}

export default Visitors;
