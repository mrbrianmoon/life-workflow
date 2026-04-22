import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';

export function useCarReminders(userId) {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(function () {
    if (!userId) return;
    loadReminders();
  }, [userId]);

  async function loadReminders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cm_reminders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setReminders(data || []);
    setLoading(false);
  }

  async function addReminder(vehicle, service, dueMileage, dueMonth, dueYear) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('cm_reminders')
      .insert([{
        user_id:     authData.user.id,
        vehicle,
        service,
        due_mileage: dueMileage || '',
        due_month:   dueMonth   || '',
        due_year:    dueYear    || '',
      }])
      .select()
      .single();

    if (error) return { error: error.message };

    setReminders(function (prev) { return [...prev, data]; });
    return { data };
  }

  async function deleteReminder(id) {
    setReminders(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });

    const { error } = await supabase.from('cm_reminders').delete().eq('id', id);
    if (error) {
      loadReminders();
      return { error: error.message };
    }
    return {};
  }

  return { reminders, loading, error, addReminder, deleteReminder };
}
