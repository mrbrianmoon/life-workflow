import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';

export function useCarEntries(userId) {
  const [entries, setEntries]   = useState({ Fusion: [], Odyssey: [], Silverado: [], Toro: [] });
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(function () {
    if (!userId) return;
    loadEntries();
  }, [userId]);

  async function loadEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cm_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Group by vehicle, already newest-first from DB order
    const grouped = { Fusion: [], Odyssey: [], Silverado: [], Toro: [] };
    (data || []).forEach(function (row) {
      if (grouped[row.vehicle]) grouped[row.vehicle].push(row);
    });

    setEntries(grouped);
    setLoading(false);
  }

  async function addEntry(vehicle, mileage, entryDate, note) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('cm_entries')
      .insert([{
        user_id:    authData.user.id,
        vehicle,
        mileage:    mileage    || '',
        entry_date: entryDate  || '',
        note:       note       || '',
      }])
      .select()
      .single();

    if (error) return { error: error.message };

    // Optimistic: prepend to the correct vehicle bucket
    setEntries(function (prev) {
      return { ...prev, [vehicle]: [data, ...prev[vehicle]] };
    });

    return { data };
  }

  async function deleteEntry(id, vehicle) {
    // Optimistic remove
    setEntries(function (prev) {
      return { ...prev, [vehicle]: prev[vehicle].filter(function (e) { return e.id !== id; }) };
    });

    const { error } = await supabase.from('cm_entries').delete().eq('id', id);
    if (error) {
      // Revert on failure
      loadEntries();
      return { error: error.message };
    }
    return {};
  }

  return { entries, loading, error, loadEntries, addEntry, deleteEntry };
}
