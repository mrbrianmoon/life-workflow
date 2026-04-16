import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient.js';

export function usePersonalSections() {
  const [sections, setSections] = useState(['General']);
  const [loading, setLoading] = useState(true);

  async function loadSections() {
    const { data, error } = await supabase
      .from('personal_sections')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Failed to load sections:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setSections(['General']);
    } else {
      setSections(data.map(function(row) { return row.name; }));
    }
    setLoading(false);
  }

  async function addSection(name) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const position = sections.length;
    const { error } = await supabase.from('personal_sections').insert([{
      user_id: authData.user.id,
      name: name,
      position: position
    }]);

    if (error) return { error: error.message };
    await loadSections();
    return { error: null };
  }

  async function renameSection(oldName, newName) {
    const { error: secError } = await supabase
      .from('personal_sections')
      .update({ name: newName })
      .eq('name', oldName);

    if (secError) return { error: secError.message };

    await supabase
      .from('tasks')
      .update({ category: newName })
      .eq('category', oldName)
      .eq('tab', 'personal');

    await loadSections();
    return { error: null };
  }

  async function deleteSection(name, fallback) {
    await supabase
      .from('tasks')
      .update({ category: fallback })
      .eq('category', name)
      .eq('tab', 'personal');

    const { error } = await supabase
      .from('personal_sections')
      .delete()
      .eq('name', name);

    if (error) return { error: error.message };
    await loadSections();
    return { error: null };
  }

  useEffect(function() {
    loadSections();
  }, []);

  return { sections, loading, loadSections, addSection, renameSection, deleteSection };
}
