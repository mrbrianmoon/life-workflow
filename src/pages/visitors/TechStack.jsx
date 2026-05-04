const STACK = [
  {
    category: 'Frontend',
    items: [
      { name: 'React 19', level: 'Daily driver' },
      { name: 'Vite', level: 'Daily driver' },
      { name: 'React Router', level: 'Comfortable' },
      { name: 'CSS Modules', level: 'Daily driver' },
      { name: '@dnd-kit', level: 'Comfortable' },
      { name: 'Hooks (useState, useEffect, useRef, custom)', level: 'Daily driver' }
    ]
  },
  {
    category: 'Backend & data',
    items: [
      { name: 'Supabase', level: 'Daily driver' },
      { name: 'PostgreSQL', level: 'Comfortable' },
      { name: 'Row-level security policies', level: 'Comfortable' },
      { name: 'Realtime channels (WebSocket)', level: 'Comfortable' },
      { name: 'Auth (email/password, sessions)', level: 'Comfortable' }
    ]
  },
  {
    category: 'Tooling & deploy',
    items: [
      { name: 'Git + GitHub', level: 'Daily driver' },
      { name: 'Vercel', level: 'Daily driver' },
      { name: 'Cursor / VS Code', level: 'Daily driver' },
      { name: 'npm', level: 'Daily driver' },
      { name: 'Bash (mac terminal)', level: 'Comfortable' }
    ]
  },
  {
    category: 'Workflow & AI',
    items: [
      { name: 'Claude (Anthropic) — pair programming, planning, debugging', level: 'Daily driver' },
      { name: 'Phase-based development with written specs', level: 'Daily driver' },
      { name: 'Iterative preview-then-build approach', level: 'Daily driver' },
      { name: 'Manual code review of every AI-generated change', level: 'Daily driver' }
    ]
  },
  {
    category: 'Project leadership (10+ years)',
    items: [
      { name: 'Multi-stakeholder coordination', level: 'Expert' },
      { name: 'Budget management ($1.8M – $4.4M scopes)', level: 'Expert' },
      { name: 'Cross-functional team leadership', level: 'Expert' },
      { name: 'Risk mitigation & resequencing', level: 'Expert' },
      { name: 'Data-driven decision making', level: 'Expert' },
      { name: 'Process improvement & change management', level: 'Expert' }
    ]
  },
  {
    category: 'Currently learning',
    items: [
      { name: 'TypeScript', level: 'Learning' },
      { name: 'Testing (Vitest, React Testing Library)', level: 'Learning' },
      { name: 'PMP certification (expected Spring 2026)', level: 'Learning' }
    ]
  }
];

function levelClass(level) {
  if (level === 'Daily driver' || level === 'Expert') return 'visitors-level-strong';
  if (level === 'Comfortable') return 'visitors-level-mid';
  return 'visitors-level-light';
}

function TechStack() {
  return (
    <div className="visitors-card">
      <div className="visitors-section-eyebrow">Tech & skills</div>
      <h2 className="visitors-section-title">Stack & skills</h2>
      <p className="visitors-section-lead">
        What I reach for, what I'm comfortable with, and what I'm currently leveling up.
      </p>

      <div className="visitors-stack-grid">
        {STACK.map(function (group, gi) {
          return (
            <div key={gi} className="visitors-stack-group">
              <h3 className="visitors-stack-heading">{group.category}</h3>
              <ul className="visitors-stack-list">
                {group.items.map(function (item, ii) {
                  return (
                    <li key={ii} className="visitors-stack-row">
                      <span className="visitors-stack-name">{item.name}</span>
                      <span className={'visitors-stack-level ' + levelClass(item.level)}>
                        {item.level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TechStack;
