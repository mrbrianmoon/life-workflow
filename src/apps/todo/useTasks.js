import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../shared/supabaseClient.js';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatShortDate(d) {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const tasksRef = useRef([]);
  const suppressRealtime = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    tasksRef.current = data || [];
    setTasks(data || []);
    setLoading(false);
  }

  async function addTask(fields) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const position = tasks.length;
    const { error } = await supabase.from('tasks').insert([{
      user_id: authData.user.id,
      name: fields.name,
      note: fields.note || '',
      category: fields.category,
      tab: fields.tab,
      origin_date: fields.origin_date,
      display_date: fields.origin_date,
      fwd_count: 0,
      done: false,
      priority: null,
      position
    }]);

    if (error) return { error: error.message };
    await loadTasks();
    return { error: null };
  }

  async function updateTask(id, fields) {
    const { error } = await supabase
      .from('tasks')
      .update(fields)
      .eq('id', id);

    if (error) return { error: error.message };
    await loadTasks();
    return { error: null };
  }

  async function toggleTask(id) {
    const task = tasks.find(function(t) { return String(t.id) === String(id); });
    if (!task) return;

    const done = !task.done;
    const completed_date = done ? formatShortDate(new Date()) : null;

    setTasks(function(prev) {
      return prev.map(function(t) {
        return String(t.id) === String(id) ? { ...t, done, completed_date } : t;
      });
    });

    await supabase.from('tasks').update({ done, completed_date }).eq('id', id);
  }

  async function deleteTask(id) {
    setTasks(function(prev) {
      return prev.filter(function(t) { return String(t.id) !== String(id); });
    });
    await supabase.from('tasks').delete().eq('id', id);
  }

  async function toggleSubtask(taskId, lineIndex) {
    const task = tasksRef.current.find(function(t) { return String(t.id) === String(taskId); });
    if (!task) return;

    const lines = (task.note || '').split('\n').map(function(line) {
      let indent = 0;
      let rest = line;
      const spaceMatch = rest.match(/^( +)/);
      if (spaceMatch) {
        indent = Math.min(2, Math.floor(spaceMatch[1].length / 2));
        rest = rest.slice(spaceMatch[1].length);
      }
      const pad = '  '.repeat(indent);
      if (rest.startsWith('[ ] ')) return { raw: line, pad, prefix: '[ ] ', text: rest.slice(4), type: 'unchecked' };
      if (rest.startsWith('[x] ') || rest.startsWith('[X] ')) return { raw: line, pad, prefix: '[x] ', text: rest.slice(4), type: 'checked' };
      return { raw: line, pad, prefix: '', text: rest, type: 'other' };
    });

    if (!lines[lineIndex] || lines[lineIndex].type === 'other') return;

    const toggled = lines[lineIndex].type === 'unchecked' ? '[x] ' : '[ ] ';
    lines[lineIndex] = { ...lines[lineIndex], prefix: toggled };

    const newNote = lines.map(function(l) {
      if (l.type === 'other') return l.raw;
      return l.pad + l.prefix + l.text;
    }).join('\n');

    setTasks(function(prev) {
      return prev.map(function(t) {
        return String(t.id) === String(taskId) ? { ...t, note: newNote } : t;
      });
    });
    tasksRef.current = tasksRef.current.map(function(t) {
      return String(t.id) === String(taskId) ? { ...t, note: newNote } : t;
    });

    await supabase.from('tasks').update({ note: newNote }).eq('id', taskId);
  }

  async function forwardTask(id) {
    const task = tasksRef.current.find(function(t) { return String(t.id) === String(id); });
    if (!task) return;

    const count = (task.fwd_count || 0) + 1;

    const parts = (task.display_date || task.origin_date || '').match(/(\w+)\s+(\d+),\s+(\d+)/);
    var baseDate;
    if (parts) {
      baseDate = new Date(`${parts[1]} ${parts[2]}, ${parts[3]}`);
    } else {
      baseDate = new Date();
    }
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    const nextStr = formatShortDate(next);

    setTasks(function(prev) {
      return prev.map(function(t) {
        return String(t.id) === String(id)
          ? { ...t, fwd_count: count, display_date: nextStr }
          : t;
      });
    });
    tasksRef.current = tasksRef.current.map(function(t) {
      return String(t.id) === String(id)
        ? { ...t, fwd_count: count, display_date: nextStr }
        : t;
    });

    await supabase.from('tasks').update({ fwd_count: count, display_date: nextStr }).eq('id', id);
  }

  async function savePositions(reordered) {
    suppressRealtime.current = true;
    try {
      const updates = reordered.map(function(task, index) {
        return supabase
          .from('tasks')
          .update({ position: index, category: task.category })
          .eq('id', task.id);
      });
      await Promise.all(updates);
    } finally {
      setTimeout(function() {
        suppressRealtime.current = false;
      }, 800);
    }
  }

  useEffect(function() {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' },
        function() { if (!suppressRealtime.current) loadTasks(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' },
        function() { if (!suppressRealtime.current) loadTasks(); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' },
        function() { if (!suppressRealtime.current) loadTasks(); })
      .subscribe();

    return function() {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(function() {
    loadTasks();
  }, []);

  return { tasks, tasksRef, setTasks, loading, error, loadTasks, addTask, updateTask, toggleTask, toggleSubtask, deleteTask, forwardTask, savePositions };
}