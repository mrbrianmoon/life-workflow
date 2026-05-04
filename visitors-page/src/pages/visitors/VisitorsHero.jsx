function VisitorsHero({ onJumpToContact }) {
  function openResume() {
    // Resume PDF lives in /public so it's served at root in production.
    // Adjust the filename here if you swap the resume out later.
    window.open('/Brian_Moon_Resume.pdf', '_blank', 'noopener,noreferrer');
  }

  function openGithub() {
    window.open('https://github.com/mrbrianmoon/life-workflow', '_blank', 'noopener,noreferrer');
  }

  function openEmail() {
    window.location.href = 'mailto:mrbrianmoon@gmail.com?subject=Software%20Engineer%20Opportunity';
  }

  return (
    <header className="visitors-hero">
      <div className="visitors-hero-inner">
        <span className="visitors-status-pill">
          <span className="visitors-status-dot" aria-hidden="true"></span>
          Open to opportunities
        </span>

        <h1 className="visitors-hero-title">Brian Moon</h1>
        <p className="visitors-hero-tagline">
          Project leader turned software developer. 10+ years shipping outcomes — now shipping code.
        </p>

        <p className="visitors-hero-blurb">
          This site is a working portfolio. Every app you see in the nav was built from scratch in React,
          backed by Supabase, and deployed to Vercel. The code, the bugs, and the lessons are all real.
        </p>

        <div className="visitors-hero-ctas">
          <button type="button" className="visitors-cta primary" onClick={openResume}>
            View resume
          </button>
          <button type="button" className="visitors-cta secondary" onClick={openEmail}>
            Email me
          </button>
          <button type="button" className="visitors-cta secondary" onClick={openGithub}>
            GitHub
          </button>
          <button type="button" className="visitors-cta ghost" onClick={onJumpToContact}>
            Jump to contact ↓
          </button>
        </div>

        <div className="visitors-hero-stats">
          <div className="visitors-stat">
            <div className="visitors-stat-num">4</div>
            <div className="visitors-stat-label">Production apps</div>
          </div>
          <div className="visitors-stat">
            <div className="visitors-stat-num">10+</div>
            <div className="visitors-stat-label">Years leading projects</div>
          </div>
          <div className="visitors-stat">
            <div className="visitors-stat-num">$4.4M</div>
            <div className="visitors-stat-label">Largest project led</div>
          </div>
          <div className="visitors-stat">
            <div className="visitors-stat-num">1</div>
            <div className="visitors-stat-label">Career pivot in motion</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default VisitorsHero;
