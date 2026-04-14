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

  useEffect(function() {
    loadSections();
  }, []);

  return { sections, loading, loadSections };
}