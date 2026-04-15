import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient.js';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatShortDate(d) {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
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

  useEffect(function() {
    loadTasks();
  }, []);

  return { tasks, loading, error, loadTasks, addTask, updateTask, toggleTask, deleteTask };
}