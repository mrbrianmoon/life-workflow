import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';

export default function ZoneManager({ zones, onZonesChange }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [sqFt, setSqFt] = useState('');
  const [grassType, setGrassType] = useState('Cool-season mix');
  const [saving, setSaving] = useState(false);

  async function addZone() {
    if (!name.trim()) return;
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('lc_zones').insert([{
      user_id: authData.user.id,
      name: name.trim(),
      sq_ft: sqFt ? parseInt(sqFt) : null,
      grass_type: grassType,
      position: zones.length
    }]);

    if (error) {
      console.error('Add zone error:', error);
      setSaving(false);
      return;
    }

    setName('');
    setSqFt('');
    setGrassType('Cool-season mix');
    setShowForm(false);
    setSaving(false);
    onZonesChange();
  }

  async function deleteZone(id) {
    if (!confirm('Delete this zone? Treatment history for this zone will be unlinked.')) return;

    const { error } = await supabase.from('lc_zones').delete().eq('id', id);
    if (error) {
      console.error('Delete zone error:', error);
      return;
    }
    onZonesChange();
  }

  return (
    <div className="zone-manager">
      <div className="zone-header">
        <h3>Yard Zones</h3>
        <button className="zone-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Add Zone'}
        </button>
      </div>

      {showForm && (
        <div className="zone-form">
          <input
            type="text"
            placeholder="Zone name (e.g. Front Yard)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addZone()}
          />
          <input
            type="number"
            placeholder="Square footage"
            value={sqFt}
            onChange={(e) => setSqFt(e.target.value)}
          />
          <select value={grassType} onChange={(e) => setGrassType(e.target.value)}>
            <option value="Cool-season mix">Cool-season mix</option>
            <option value="Kentucky Bluegrass">Kentucky Bluegrass</option>
            <option value="Tall Fescue">Tall Fescue</option>
            <option value="Perennial Ryegrass">Perennial Ryegrass</option>
            <option value="Fine Fescue">Fine Fescue</option>
          </select>
          <button className="zone-save-btn" onClick={addZone} disabled={saving}>
            {saving ? 'Saving...' : 'Save Zone'}
          </button>
        </div>
      )}

      {zones.length === 0 ? (
        <p className="zone-empty">No zones yet — add your yard areas to get started.</p>
      ) : (
        <div className="zone-list">
          {zones.map((zone) => (
            <div key={zone.id} className="zone-card">
              <div className="zone-info">
                <span className="zone-name">{zone.name}</span>
                <span className="zone-details">
                  {zone.sq_ft ? `${zone.sq_ft.toLocaleString()} sq ft` : 'No size set'}
                  {' · '}
                  {zone.grass_type || 'Cool-season mix'}
                </span>
              </div>
              <button className="zone-delete-btn" onClick={() => deleteZone(zone.id)} title="Delete">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
