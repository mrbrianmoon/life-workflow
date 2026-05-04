function ContactSection() {
  return (
    <div className="visitors-card">
      <div className="visitors-section-eyebrow">Get in touch</div>
      <h2 className="visitors-section-title">Let's talk</h2>
      <p className="visitors-section-lead">
        I'm actively pursuing entry-level/junior software engineering & full stack developer roles. Best way to reach me is email — I read every message and reply within a day.
      </p>

      <div className="visitors-contact-grid">
        <a href="mailto:mrbrianmoon@gmail.com?subject=Software%20Engineer%20Opportunity" className="visitors-contact-card">
          <div className="visitors-contact-label">Email</div>
          <div className="visitors-contact-value">mrbrianmoon@gmail.com</div>
        </a>

        <a href="https://github.com/mrbrianmoon" target="_blank" rel="noopener noreferrer" className="visitors-contact-card">
          <div className="visitors-contact-label">GitHub</div>
          <div className="visitors-contact-value">github.com/mrbrianmoon</div>
        </a>

        <a href="tel:+13175173493" className="visitors-contact-card">
          <div className="visitors-contact-label">Phone</div>
          <div className="visitors-contact-value">317-517-3493</div>
        </a>

        <div className="visitors-contact-card static">
          <div className="visitors-contact-label">Location</div>
          <div className="visitors-contact-value">Noblesville, IN — open to remote</div>
        </div>
      </div>

      <div className="visitors-contact-note">
        <p>
          <strong>What I'm looking for:</strong> a junior or associate software engineer or full stack developer role on a team
          that ships real software to real users. I love to build, fix, and build again.I learn quickly, write code I understand, and bring
          a decade of experience running projects that landed on time and under budget.
        </p>
      </div>
    </div>
  );
}

export default ContactSection;
