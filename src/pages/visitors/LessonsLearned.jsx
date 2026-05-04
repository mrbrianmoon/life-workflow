import { useState } from 'react';

const LESSONS = [
  {
    title: 'Stale closure in drag handler',
    where: 'To Do — Phase 3, Step 6',
    symptom: 'After dropping a dragged task into a new position, the list snapped to the new order visually but reset 1 second later. A page refresh showed the correct order, so writes were succeeding.',
    cause: 'handleDragEnd captured the tasks array from the render where it was defined. By the time the user dropped, that closure was stale, and the merge sort produced an order based on outdated data which then overwrote the optimistic state.',
    fix: 'Added a tasksRef alongside tasks state. loadTasks updates both. handleDragEnd reads tasksRef.current — always current — instead of the closed-over tasks variable. Used a position map for the merge instead of a complex sort.',
    takeaway: 'Async callbacks and closures do not mix cleanly with React state. useRef is the right escape hatch when you need always-current data inside a callback that fires later.'
  },
  {
    title: 'Realtime race condition on writes',
    where: 'To Do — Phase 4',
    symptom: 'Second drag in a row would snap to the new position then revert for ~1 second before correcting itself. First drag was always clean.',
    cause: 'savePositions fires multiple Supabase UPDATE calls in parallel. Each UPDATE triggers the realtime channel, which fires loadTasks and overwrites tasksRef.current with stale data before all writes complete.',
    fix: 'Added a suppressRealtime ref. Set it to true before write operations and clear it after 800ms in a finally block. All three realtime event handlers (INSERT, UPDATE, DELETE) check suppressRealtime.current before calling loadTasks.',
    takeaway: 'Realtime sync is great until your own writes echo back at you. A short suppression window during writes is a clean way to gate it.'
  },
  {
    title: 'RLS: auth.role vs auth.uid',
    where: 'Security setup — March 2026',
    symptom: 'Original RLS policies used auth.role() = "authenticated", which meant any logged-in user could in theory modify any other user\'s rows.',
    cause: 'auth.role() only checks that someone is signed in. It does not check ownership. Frontend code that filters by user ID does not protect against direct API calls.',
    fix: 'Added user_id columns with foreign keys to auth.users. Backfilled existing rows. Replaced policies with auth.uid() = user_id. Updated every INSERT path on the frontend to include the current user_id from db.auth.getUser().',
    takeaway: 'Database-level access control is the actual security boundary. Frontend logic is UX. RLS is a habit worth building early, even on single-user apps.'
  },
  {
    title: 'Drag overlay shape changing mid-drag',
    where: 'To Do — Phase 3, Step 6',
    symptom: 'When dragging a task, the floating drag preview kept changing dimensions as it passed over different drop targets.',
    cause: 'Default @dnd-kit behavior uses drop target dimensions for the overlay rather than the source.',
    fix: 'Rendered an explicit DragOverlay component containing a real TaskCard at fixed source dimensions, with dropAnimation set to null for instant snap on release.',
    takeaway: 'Library defaults are a starting point, not a finishing point. Reading the docs to find the right escape hatch is faster than fighting the symptom.'
  },
  {
    title: 'iCloud Drive folder path with spaces',
    where: 'Local development workflow',
    symptom: 'Cursor was occasionally saving files into the wrong folder. Git would not see changes I had made.',
    cause: 'The project lives in an iCloud Drive path with spaces. Cursor opened to a slightly different folder root than the terminal was running in. Both paths "looked right" but were different working directories.',
    fix: 'Always open Cursor to the exact correct folder root. Verified by running pwd in the integrated terminal and matching it against the path the editor reports. Documented in PHASE_4 notes for future reference.',
    takeaway: 'When code "obviously isn\'t taking effect," the problem is sometimes not in the code. Caches, working directories, and stale dev servers are real culprits worth checking first.'
  },
  {
    title: 'Vite cache masking CSS changes',
    where: 'To Do — Phase 6A',
    symptom: 'CSS changes appeared not to take effect. Tried multiple "fixes" before realizing the file on disk was already correct.',
    cause: 'Vite was serving cached compiled CSS that did not reflect the file changes on disk.',
    fix: 'Added server: { force: true } to vite.config.js. Now every npm run dev clears the dependency cache.',
    takeaway: 'Diagnose what you\'re actually seeing before changing more code. The browser screen is the end of a long chain — any link in that chain can lie to you.'
  },
  {
    title: 'Vercel hard-refresh 404 on client-side routes',
    where: 'Car Maintenance — Phase 6B',
    symptom: 'Hard-refreshing on /car-maintenance or any non-root route returned a Vercel 404.',
    cause: 'Vercel was treating client-side routes as real file paths. The single-page app needs all unknown paths rewritten to index.html.',
    fix: 'Added vercel.json with a rewrite rule: { "source": "/(.*)", "destination": "/" }.',
    takeaway: 'Single-page apps and the deploy platform have to agree on routing. Two-line config files solve this for good.'
  }
];

function LessonCard({ lesson, isOpen, onToggle }) {
  return (
    <div className={'visitors-lesson-card' + (isOpen ? ' open' : '')}>
      <button
        type="button"
        className="visitors-lesson-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="visitors-lesson-header-left">
          <div className="visitors-lesson-title">{lesson.title}</div>
          <div className="visitors-lesson-where">{lesson.where}</div>
        </div>
        <span className="visitors-lesson-toggle" aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="visitors-lesson-body">
          <div className="visitors-lesson-row">
            <span className="visitors-lesson-label">Symptom</span>
            <p>{lesson.symptom}</p>
          </div>
          <div className="visitors-lesson-row">
            <span className="visitors-lesson-label">Root cause</span>
            <p>{lesson.cause}</p>
          </div>
          <div className="visitors-lesson-row">
            <span className="visitors-lesson-label">Fix</span>
            <p>{lesson.fix}</p>
          </div>
          <div className="visitors-lesson-row takeaway">
            <span className="visitors-lesson-label">Takeaway</span>
            <p>{lesson.takeaway}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonsLearned() {
  const [openIndex, setOpenIndex] = useState(0);

  function toggle(index) {
    setOpenIndex(function (current) {
      return current === index ? -1 : index;
    });
  }

  return (
    <div className="visitors-card">
      <div className="visitors-section-eyebrow">Lessons learned</div>
      <h2 className="visitors-section-title">Real bugs, real fixes</h2>
      <p className="visitors-section-lead">
        Every one of these was a real symptom I hit while building. The pattern that separates them isn't
        "I knew the answer" — it's "I knew how to find it." Each card is symptom → root cause → fix → what I'd do differently.
      </p>

      <div className="visitors-lesson-list">
        {LESSONS.map(function (lesson, i) {
          return (
            <LessonCard
              key={i}
              lesson={lesson}
              isOpen={openIndex === i}
              onToggle={function () { toggle(i); }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default LessonsLearned;
