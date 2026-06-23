import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';

// ── Routines + their exercises ────────────────────────────────────
// One hook owns both tables. Routines are loaded with their exercises
// nested under an `exercises` array, mirroring the prototype's shape
// (routine.exercises) so the UI components port over unchanged.
//
// Follows the useCarReminders pattern: RLS scopes every select to the
// signed-in user (no explicit .eq('user_id') needed), inserts re-fetch
// the user via getUser(), mutations return { error } on failure and
// resync from the server when an optimistic write fails.

export function useRoutines(userId) {
  const [routines, setRoutines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(function () {
    if (!userId) return;
    loadRoutines();
  }, [userId]);

  async function loadRoutines() {
    setLoading(true);

    // Pull routines and exercises in two RLS-scoped reads, then stitch
    // exercises onto their routine. Ordered by position to preserve
    // the user's arrangement.
    const routinesRes = await supabase
      .from('workout_routines')
      .select('*')
      .order('position', { ascending: true });

    if (routinesRes.error) {
      setError(routinesRes.error.message);
      setLoading(false);
      return;
    }

    const exercisesRes = await supabase
      .from('workout_exercises')
      .select('*')
      .order('position', { ascending: true });

    if (exercisesRes.error) {
      setError(exercisesRes.error.message);
      setLoading(false);
      return;
    }

    const exByRoutine = {};
    (exercisesRes.data || []).forEach(function (ex) {
      (exByRoutine[ex.routine_id] = exByRoutine[ex.routine_id] || []).push(ex);
    });

    const stitched = (routinesRes.data || []).map(function (r) {
      return { ...r, exercises: exByRoutine[r.id] || [] };
    });

    setRoutines(stitched);
    setLoading(false);
  }

  // ── Routine CRUD ────────────────────────────────────────────────
  async function addRoutine(name) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const position = routines.length;

    const { data, error } = await supabase
      .from('workout_routines')
      .insert([{ user_id: authData.user.id, name, position }])
      .select()
      .single();

    if (error) return { error: error.message };

    setRoutines(function (prev) { return [...prev, { ...data, exercises: [] }]; });
    return { data };
  }

  async function deleteRoutine(id) {
    setRoutines(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });

    // exercises + sessions cascade-delete at the DB level
    const { error } = await supabase.from('workout_routines').delete().eq('id', id);
    if (error) {
      loadRoutines();
      return { error: error.message };
    }
    return {};
  }

  // ── Exercise CRUD ───────────────────────────────────────────────
  async function addExercise(routineId) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const routine = routines.find(function (r) { return r.id === routineId; });
    const position = routine ? routine.exercises.length : 0;

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert([{ user_id: authData.user.id, routine_id: routineId, position }])
      .select()
      .single();

    if (error) return { error: error.message };

    setRoutines(function (prev) {
      return prev.map(function (r) {
        return r.id === routineId
          ? { ...r, exercises: [...r.exercises, data] }
          : r;
      });
    });
    return { data };
  }

  // Patch one or more fields on an exercise. Caller decides when to call
  // this (e.g. debounced on text fields, immediate on set chips) so the
  // hook stays unopinionated about write timing.
  async function updateExercise(routineId, exerciseId, patch) {
    // Optimistic local update first so typing/tapping feels instant.
    setRoutines(function (prev) {
      return prev.map(function (r) {
        if (r.id !== routineId) return r;
        return {
          ...r,
          exercises: r.exercises.map(function (e) {
            return e.id === exerciseId ? { ...e, ...patch } : e;
          }),
        };
      });
    });

    const { error } = await supabase
      .from('workout_exercises')
      .update(patch)
      .eq('id', exerciseId);

    if (error) {
      loadRoutines();
      return { error: error.message };
    }
    return {};
  }

  async function deleteExercise(routineId, exerciseId) {
    setRoutines(function (prev) {
      return prev.map(function (r) {
        return r.id === routineId
          ? { ...r, exercises: r.exercises.filter(function (e) { return e.id !== exerciseId; }) }
          : r;
      });
    });

    const { error } = await supabase.from('workout_exercises').delete().eq('id', exerciseId);
    if (error) {
      loadRoutines();
      return { error: error.message };
    }
    return {};
  }

  // Reset the completed-set count for every exercise in a routine
  // (used after logging a session, or a manual "reset checks").
  async function resetSets(routineId) {
    const routine = routines.find(function (r) { return r.id === routineId; });
    if (!routine) return {};

    setRoutines(function (prev) {
      return prev.map(function (r) {
        return r.id === routineId
          ? { ...r, exercises: r.exercises.map(function (e) { return { ...e, sets_done: 0 }; }) }
          : r;
      });
    });

    const { error } = await supabase
      .from('workout_exercises')
      .update({ sets_done: 0 })
      .eq('routine_id', routineId);

    if (error) {
      loadRoutines();
      return { error: error.message };
    }
    return {};
  }

  return {
    routines,
    loading,
    error,
    addRoutine,
    deleteRoutine,
    addExercise,
    updateExercise,
    deleteExercise,
    resetSets,
  };
}
