const MILESTONES = [
  {
    period: '2011 — 2022',
    title: 'Educator & Program Coordinator',
    body: 'Managed 20+ individualized project plans simultaneously. Built and led athletic programs that grew from 13 → 77 (Wrestling) and 74 → 160+ (Track & Field) members. First exposure to running concurrent initiatives with hard deadlines.',
    chips: ['Cross-functional teams', 'Stakeholder reporting', 'Process standardization']
  },
  {
    period: '2022 — Dec 2022',
    title: 'Compliance & Intervention Program Manager',
    body: 'Owned a $1.8M federally regulated program. Led training that produced an average 18% improvement in skill accuracy across the team. Quarterly performance reviews, regulatory compliance, vendor coordination.',
    chips: ['$1.8M budget', 'Federal compliance', 'Team of 8+']
  },
  {
    period: 'Jan 2023 — Present',
    title: 'Asst. Director of Operations / Asst. Principal',
    body: 'Directed a $4.4M HVAC renovation. Made the call to scope a third boiler — $975K upfront, but eliminated $363K in future expenditures. Led behavior reform projects: 52% drug incident reduction, 24% disciplinary referral reduction, 150% hybrid program enrollment growth.',
    chips: ['$4.4M project', 'Risk mitigation', 'Data-driven decisions', 'Policy reform'],
    accent: true
  },
  {
    period: '2024 — Now',
    title: 'Self-directed full-stack development',
    body: 'Started learning React in earnest. Built life-workflow as my daily-driver productivity suite and primary technical evidence. Four production apps, real-time sync, drag-and-drop, RLS-backed multi-user data, deployed on Vercel. AI is the accelerator; understanding the code is the requirement.',
    chips: ['React + Vite', 'Supabase + RLS', '@dnd-kit', 'Vercel', 'AI-accelerated workflow'],
    pivot: true
  }
];

function JourneyTimeline() {
  return (
    <div className="visitors-card">
      <div className="visitors-section-eyebrow">My journey</div>
      <h2 className="visitors-section-title">From program management to production code</h2>
      <p className="visitors-section-lead">
        I've spent a decade running projects where the deliverable was a working program, a finished
        renovation, or a measurable behavior change. The skills transfer cleanly: scope it, ship it,
        own the bugs. Software is the new medium.
      </p>

      <ol className="visitors-timeline">
        {MILESTONES.map(function (m, i) {
          const dotClass = 'visitors-timeline-dot' +
            (m.pivot ? ' pivot' : '') +
            (m.accent ? ' accent' : '');
          return (
            <li key={i} className="visitors-timeline-item">
              <span className={dotClass} aria-hidden="true"></span>
              <div className="visitors-timeline-period">{m.period}</div>
              <div className="visitors-timeline-title">{m.title}</div>
              <p className="visitors-timeline-body">{m.body}</p>
              {m.chips && m.chips.length > 0 && (
                <div className="visitors-chip-row">
                  {m.chips.map(function (chip, ci) {
                    return <span key={ci} className="visitors-chip">{chip}</span>;
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default JourneyTimeline;
