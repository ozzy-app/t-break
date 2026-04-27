import { useState } from 'react';
import { createTeam, updateTeam, deleteTeam, computeTextColor, useTeams } from '../lib/TeamsContext';

// Company preset colors
const PRESETS = [
  { hex: '#d82335', label: 'Rood (primair)' },
  { hex: '#b0001f', label: 'Rood (donker)' },
  { hex: '#09ad8c', label: 'Teal (primair)' },
  { hex: '#53c6af', label: 'Teal (licht)' },
  { hex: '#ffcc00', label: 'Geel (Freedom)' },
  // Extra palette
  { hex: '#3b82f6', label: 'Blauw' },
  { hex: '#8b5cf6', label: 'Paars' },
  { hex: '#f97316', label: 'Oranje' },
  { hex: '#10b981', label: 'Groen' },
  { hex: '#6366f1', label: 'Indigo' },
];

// ── Square color picker ──────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  const hexToHsl = (hex) => {
    if (!hex || hex.length < 7) return [0, 0, 50];
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{
      const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}
    }
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  };
  const hslToHex = (h,s,l) => {
    s/=100; l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return '#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
  };

  const [hsl, setHsl] = useState(() => hexToHsl(value || '#d82335'));
  const [hex, setHex] = useState(value || '#d82335');

  const applyHex = (h) => { setHex(h); setHsl(hexToHsl(h)); onChange(h); };

  const updateHsl = (i, v) => {
    const next = [...hsl]; next[i] = v; setHsl(next);
    const h = hslToHex(...next);
    setHex(h); onChange(h);
  };
  const updateHex = (v) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { setHsl(hexToHsl(v)); onChange(v); }
  };

  const textColor = computeTextColor(hex);

  return (
    <div className="bm-cp">
      {/* Preview bar */}
      <div className="bm-cp-preview" style={{ background: hex, color: textColor }}>
        Aa
      </div>

      {/* Preset swatches — square grid */}
      <div className="bm-cp-swatches">
        {PRESETS.map(p => (
          <button
            key={p.hex}
            className={`bm-cp-swatch ${hex.toLowerCase() === p.hex ? 'bm-cp-swatch-active' : ''}`}
            style={{ background: p.hex }}
            onClick={() => applyHex(p.hex)}
            title={p.label}
          />
        ))}
      </div>

      {/* HSL sliders */}
      <div className="bm-cp-sliders">
        {[['H', 0, 359, 'bm-cp-slider-hue'], ['S', 0, 100, ''], ['L', 10, 90, '']].map(([lbl, min, max, cls], i) => (
          <label key={lbl} className="bm-cp-slider-row">
            <span className="bm-cp-slider-lbl">{lbl}</span>
            <input type="range" min={min} max={max} value={hsl[i]}
              onChange={e => updateHsl(i, +e.target.value)}
              className={`bm-cp-slider ${cls}`}
            />
            <span className="bm-cp-slider-val">{hsl[i]}{i === 0 ? '°' : '%'}</span>
          </label>
        ))}
      </div>

      {/* Hex input */}
      <div className="bm-cp-hex-row">
        <span>HEX</span>
        <input className="bm-input bm-cp-hex-input"
          value={hex} onChange={e => updateHex(e.target.value)}
          placeholder="#000000" maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ── Single team row ──────────────────────────────────────────────
function TeamRow({ team, state, onSaved, onDeleted, notify }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(team.label);
  const [color, setColor] = useState(team.color);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    if (!label.trim()) { notify('Naam mag niet leeg zijn', 'warn'); return; }
    setBusy(true);
    try {
      await updateTeam(team.id, { label: label.trim(), color });
      notify(`Team "${label.trim()}" bijgewerkt`, 'ok');
      setEditing(false); onSaved?.();
    } catch (e) { notify('Fout: ' + e.message, 'warn'); }
    setBusy(false);
  };

  const del = async () => {
    setBusy(true);
    try {
      await deleteTeam(team.id);
      notify(`Team "${team.label}" verwijderd`, 'ok');
      onDeleted?.();
    } catch (e) { notify('Kan niet verwijderen: ' + e.message, 'warn'); }
    setBusy(false); setConfirmDelete(false);
  };

  const memberCount = Object.values(state?.sessions || {})
    .filter(s => s.team === team.id && Date.now() - (s.lastSeen || 0) < 15 * 60 * 1000).length;

  return (
    <div className="bm-te-row">
      {/* Color swatch */}
      <div className="bm-te-swatch" style={{ background: team.color }} />

      {/* List view */}
      {!editing && (
        <>
          <div className="bm-te-info">
            <span className="bm-te-label">{team.label}</span>
            {memberCount > 0 && (
              <span className="bm-te-members">{memberCount} online</span>
            )}
          </div>
          {/* Pencil button instead of hex code */}
          <button
            className="bm-te-edit-btn"
            onClick={() => setEditing(true)}
            title="Team bewerken"
            aria-label="Team bewerken"
          >
            ✏️
          </button>
        </>
      )}

      {/* Edit view */}
      {editing && (
        <div className="bm-te-edit">
          <input className="bm-input bm-te-name-input"
            value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Teamnaam"
          />
          <ColorPicker value={color} onChange={setColor} />
          <div className="bm-te-edit-actions">
            <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={save} disabled={busy}>
              {busy ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button className="bm-btn bm-btn-ghost bm-btn-sm"
              onClick={() => { setEditing(false); setLabel(team.label); setColor(team.color); setConfirmDelete(false); }}>
              Annuleren
            </button>
            {confirmDelete ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>Zeker weten?</span>
                <button className="bm-btn bm-btn-sm"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={del} disabled={busy}>Ja, verwijder</button>
                <button className="bm-btn bm-btn-ghost bm-btn-sm"
                  onClick={() => setConfirmDelete(false)}>Nee</button>
              </>
            ) : (
              <button className="bm-btn bm-btn-ghost bm-btn-sm"
                style={{ color: memberCount > 0 ? 'var(--ink-3)' : 'var(--danger)' }}
                title={memberCount > 0 ? 'Team heeft actieve leden' : 'Verwijder team'}
                onClick={() => setConfirmDelete(true)} disabled={busy}>
                🗑 Verwijder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TeamEditor modal ────────────────────────────────────────
export function TeamEditor({ state, onClose, notify }) {
  const teams = useTeams();
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#d82335');
  const [addBusy, setAddBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const addTeam = async () => {
    if (!newLabel.trim()) { notify('Naam is verplicht', 'warn'); return; }
    setAddBusy(true);
    try {
      await createTeam({ label: newLabel.trim(), color: newColor });
      notify(`Team "${newLabel.trim()}" aangemaakt`, 'ok');
      setNewLabel(''); setNewColor('#d82335'); setShowAdd(false);
    } catch (e) { notify('Fout: ' + e.message, 'warn'); }
    setAddBusy(false);
  };

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-modal-head">
          <div>
            <div className="bm-modal-title">Teams beheren</div>
            <div className="bm-modal-sub">Klik op het potlood om te bewerken</div>
          </div>
          <button className="bm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="bm-te-list">
          {teams.map(t => (
            <TeamRow key={t.id} team={t} state={state}
              onSaved={() => {}} onDeleted={() => {}} notify={notify} />
          ))}
        </div>

        <div className="bm-te-footer">
          {showAdd ? (
            <div className="bm-te-new">
              <input className="bm-input bm-te-name-input"
                value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Teamnaam" autoFocus
              />
              <ColorPicker value={newColor} onChange={setNewColor} />
              <div className="bm-te-edit-actions">
                <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={addTeam} disabled={addBusy}>
                  {addBusy ? 'Aanmaken…' : '+ Aanmaken'}
                </button>
                <button className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => setShowAdd(false)}>
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <button className="bm-btn bm-btn-primary bm-te-add-btn" onClick={() => setShowAdd(true)}>
              + Nieuw team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Alias for backwards compatibility with LeaderPanel import
export { TeamEditor as TeamEditorModal };
