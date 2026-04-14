export function buildRenderPlan(tasks, activeTab, selectedDate, sections, formatShortDate) {
    const currentDateStr = formatShortDate(selectedDate);
  
    const sorted = [...tasks].sort(function(a, b) {
      return (a.position ?? 0) - (b.position ?? 0);
    });
  
    const visible = sorted.filter(function(row) {
      const taskTab = row.tab || 'work';
      if (taskTab !== activeTab) return false;
      if (activeTab === 'work') {
        if (row.category === 'Ongoing') return true;
        const taskDate = row.display_date || row.origin_date;
        return taskDate === currentDateStr;
      }
      return true;
    });
  
    const plan = [];
  
    if (activeTab === 'personal') {
      const active = visible.filter(function(r) { return !r.done; });
      const completed = visible.filter(function(r) { return r.done; });
  
      sections.forEach(function(sectionName) {
        const sectionTasks = active.filter(function(r) { return r.category === sectionName; });
        plan.push({ type: 'label', key: 'sec:' + sectionName, text: sectionName, completed: false });
        sectionTasks.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      });
  
      const knownSections = new Set(sections);
      const orphaned = active.filter(function(r) { return !knownSections.has(r.category); });
      orphaned.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
  
      if (completed.length > 0) {
        plan.push({ type: 'label', key: 'completed', text: 'Completed', completed: true });
        completed.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      }
  
    } else {
      const active = visible.filter(function(r) { return !r.done; });
      const completed = visible.filter(function(r) { return r.done; });
  
      const students    = active.filter(function(r) { return r.category === 'Students'; });
      const actionItems = active.filter(function(r) { return r.category === 'Action Items'; });
      const ongoing     = active.filter(function(r) { return r.category === 'Ongoing'; });
      const other       = active.filter(function(r) {
        return r.category !== 'Students' &&
               r.category !== 'Action Items' &&
               r.category !== 'Ongoing';
      });
  
      if (students.length > 0) {
        plan.push({ type: 'label', key: 'sec:Students', text: 'Students', completed: false });
        students.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      }
  
      if (actionItems.length > 0) {
        plan.push({ type: 'label', key: 'sec:Action Items', text: 'Action Items', completed: false });
        actionItems.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      }
  
      if (ongoing.length > 0) {
        plan.push({ type: 'label', key: 'sec:Ongoing', text: 'Ongoing', completed: false });
        ongoing.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      }
  
      if (other.length > 0) {
        const categories = {};
        other.forEach(function(row) {
          const cat = row.category || 'General';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(row);
        });
        Object.entries(categories).forEach(function([cat, items]) {
          plan.push({ type: 'label', key: 'sec:' + cat, text: cat, completed: false });
          items.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
        });
      }
  
      if (completed.length > 0) {
        plan.push({ type: 'label', key: 'completed', text: 'Completed', completed: true });
        completed.forEach(function(r) { plan.push({ type: 'task', key: 'task:' + r.id, row: r }); });
      }
    }
  
    return plan;
  }