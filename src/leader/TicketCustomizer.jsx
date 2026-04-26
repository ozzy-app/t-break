import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sb } from '../lib/supabase';

// ── Ticket style presets ────────────────────────────────────────
const PRESETS = [
  {
    id: 'cinema',
    name: 'Cinema',
    desc: 'Klassiek bioscoopticket',
    style: {
      radius: 10, perfStyle: 'dots', labelSize: 11, typeSize: 38,
      fontFamily: 'Bebas Neue', stubRatio: 0.32,
      shadow: '0 6px 20px rgba(0,0,0,0.22)',
    },
  },
  {
    id: 'boarding',
    name: 'Boarding Pass',
    desc: 'Luchthaven instapkaart',
    style: {
      radius: 8, perfStyle: 'zigzag', labelSize: 9, typeSize: 28,
      fontFamily: 'Geist Mono', stubRatio: 0.38,
      shadow: '0 4px 16px rgba(0,0,0,0.15)',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Strak en eenvoudig',
    style: {
      radius: 4, perfStyle: 'line', labelSize: 10, typeSize: 32,
      fontFamily: 'Geist', stubRatio: 0.28,
      shadow: '0 2px 8px rgba(0,0,0,0.10)',
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    desc: 'Vintage festivalticket',
    style: {
      radius: 16, perfStyle: 'dots', labelSize: 12, typeSize: 42,
      fontFamily: 'Bebas Neue', stubRatio: 0.35,
      shadow: '0 8px 24px rgba(0,0,0,0.20), inset 0 0 0 2px rgba(255,255,255,0.15)',
    },
  },
  {
    id: 'card',
    name: 'Card',
    desc: 'Moderne kaart stijl',
    style: {
      radius: 20, perfStyle: 'none', labelSize: 10, typeSize: 30,
      fontFamily: 'Geist', stubRatio: 0.30,
      shadow: '0 12px 32px rgba(0,0,0,0.18)',
    },
  },
];

const STORAGE_KEY = 'tbreak-ticket-style';

// Load saved style from Supabase app_state or localStorage fallback
export async function loadTicketStyle() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function saveTicketStyle(style) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(style)); } catch {}
}

// Default style (Cinema preset with BRB colors)
export const DEFAULT_TICKET_STYLE = {
  preset: 'cinema',
  brb:   { bg: '#08AD8B', fg: '#ffffff' },
  short: { bg: '#fff6eb', fg: '#b93a39' },
  lunch: { bg: '#b93a39', fg: '#ffffff' },
  ...PRESETS[0].style,
};

// ── Color picker ───────────────────────────────────────────────
function ColorPicker({ label, value, onChange }) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);
  return (
    <div className="btc-color-row">
      <span className="btc-color-label">{label}</span>
      <input type="color" value={hex}
        onChange={e => { setHex(e.target.value); onChange(e.target.value); }}
        className="btc-color-input"
      />
      <input type="text" value={hex} maxLength={7}
        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) { setHex(e.target.value); if (e.target.value.length === 7) onChange(e.target.value); } }}
        className="btc-hex-input"
      />
    </div>
  );
}

// ── Live preview ticket ────────────────────────────────────────
function PreviewTicket({ type, style }) {
  const colors = style[type] || style.brb;
  const preset = PRESETS.find(p => p.id === style.preset) || PRESETS[0];
  const labels = { brb: 'BRB', short: 'BREAK', lunch: 'LUNCH' };
  const typeLabels = { brb: 'BRB', short: '— BREAK', lunch: 'LUNCH' };

  const isZigzag = preset.style.perfStyle === 'zigzag';
  const isDots = preset.style.perfStyle === 'dots';
  const isLine = preset.style.perfStyle === 'line';
  const isNone = preset.style.perfStyle === 'none';
  const isBoarding = style.preset === 'boarding';

  return (
    <div className="btc-preview-ticket" style={{
      background: colors.bg,
      color: colors.fg,
      borderRadius: style.radius,
      boxShadow: style.shadow,
      fontFamily: style.fontFamily === 'Geist Mono' ? 'Geist Mono, monospace'
        : style.fontFamily === 'Geist' ? 'Geist, sans-serif'
        : 'Bebas Neue, sans-serif',
      width: isBoarding ? 220 : 128,
      minHeight: isBoarding ? 96 : 200,
      flexDirection: isBoarding ? 'row' : 'column',
    }}>
      {/* Main body */}
      <div className="btc-preview-body" style={{ flex: 1, padding: isBoarding ? '14px 16px' : '16px 14px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontSize: style.labelSize, letterSpacing: '0.22em', opacity: 0.75, textTransform: 'uppercase' }}>T-BREAK</div>
        {isBoarding && <div style={{ fontSize: 9, letterSpacing: '0.14em', opacity: 0.6, marginTop: 4, textTransform: 'uppercase' }}>Break Ticket</div>}
        <div style={{ fontSize: style.typeSize, lineHeight: 0.9, letterSpacing: '0.02em', marginTop: 8 }}>
          {typeLabels[type]}
        </div>
        {!isBoarding && <div style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.65, marginTop: 4, textTransform: 'uppercase' }}>Tik om te nemen</div>}
        {isBoarding && <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 8, opacity: 0.55, letterSpacing: '0.14em' }}>DUUR</div>
          <div style={{ fontSize: 13, letterSpacing: '0.08em' }}>{type === 'brb' ? '3 MIN' : type === 'short' ? '15 MIN' : '30 MIN'}</div>
        </div>}
      </div>

      {/* Perforation */}
      {!isNone && (
        <div style={{
          [isBoarding ? 'width' : 'height']: isLine ? '1px' : '12px',
          background: isLine ? `${colors.fg}33` : 'none',
          display: 'flex',
          flexDirection: isBoarding ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isDots ? 'space-around' : 'center',
          padding: isBoarding ? '4px 0' : '0 4px',
          position: 'relative',
          overflow: 'visible',
        }}>
          {isDots && [0,1,2,3].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg)', opacity: 0.9 }} />
          ))}
          {isZigzag && (
            <svg viewBox="0 0 200 12" style={{ width: isBoarding ? 12 : '100%', height: isBoarding ? '100%' : 12, flexShrink: 0 }}>
              <polyline points="0,0 10,12 20,0 30,12 40,0 50,12 60,0 70,12 80,0 90,12 100,0 110,12 120,0 130,12 140,0 150,12 160,0 170,12 180,0 190,12 200,0"
                fill="none" stroke={colors.bg} strokeWidth="14" />
            </svg>
          )}
        </div>
      )}

      {/* Stub */}
      {!isBoarding && (
        <div style={{
          height: `${Math.round(style.stubRatio * 200)}px`,
          borderTop: `1.5px dashed ${colors.fg}44`,
          padding: '8px 14px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          opacity: 0.9,
        }}>
          <div style={{ fontSize: 22, lineHeight: 1, letterSpacing: '0.04em' }}>#01</div>
          <div style={{ fontSize: 8, letterSpacing: '0.14em', opacity: 0.7, marginTop: 2 }}>TIK: NEEM</div>
        </div>
      )}
      {isBoarding && (
        <div style={{
          width: 70, borderLeft: `1.5px dashed ${colors.fg}44`,
          padding: '14px 10px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4,
        }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>#01</div>
          <div style={{ fontSize: 7, letterSpacing: '0.12em', opacity: 0.65 }}>NEEM</div>
        </div>
      )}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────
export function TicketCustomizerModal({ onClose, onApply, currentStyle }) {
  const [style, setStyle] = useState({ ...DEFAULT_TICKET_STYLE, ...currentStyle });
  const [previewType, setPreviewType] = useState('brb');

  const setColor = (type, key, val) =>
    setStyle(s => ({ ...s, [type]: { ...s[type], [key]: val } }));

  const applyPreset = (preset) => {
    setStyle(s => ({ ...s, preset: preset.id, ...preset.style }));
  };

  const handleApply = () => {
    saveTicketStyle(style);
    onApply(style);
    onClose();
  };

  return createPortal(
    <div className="bm-modal-backdrop" onClick={onClose}>
      <div className="bm-modal-popup btc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, width: '95vw' }}>
        <div className="bm-modal-header">
          <div>
            <div className="bm-modal-title">Ticket stijl aanpassen</div>
            <div className="bm-modal-sub">Pas het uiterlijk van de pauze-tickets aan</div>
          </div>
          <button className="bm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="btc-body">
          {/* Left — controls */}
          <div className="btc-controls">
            {/* Preset buttons */}
            <div className="btc-section-label">Stijl</div>
            <div className="btc-presets">
              {PRESETS.map(p => (
                <button key={p.id}
                  className={`btc-preset-btn ${style.preset === p.id ? 'btc-preset-active' : ''}`}
                  onClick={() => applyPreset(p)}
                  title={p.desc}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Color pickers per break type */}
            {['brb', 'short', 'lunch'].map(type => (
              <div key={type} className="btc-type-section">
                <div className="btc-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="btc-type-dot" style={{ background: style[type]?.bg }} />
                  {type === 'brb' ? 'BRB' : type === 'short' ? 'Korte pauze' : 'Lunchpauze'}
                </div>
                <ColorPicker label="Achtergrond" value={style[type]?.bg || '#000'} onChange={v => setColor(type, 'bg', v)} />
                <ColorPicker label="Tekst / rand" value={style[type]?.fg || '#fff'} onChange={v => setColor(type, 'fg', v)} />
              </div>
            ))}
          </div>

          {/* Right — live preview */}
          <div className="btc-preview-panel">
            <div className="btc-section-label">Voorbeeld</div>
            <div className="btc-type-tabs">
              {['brb', 'short', 'lunch'].map(t => (
                <button key={t}
                  className={`btc-type-tab ${previewType === t ? 'btc-type-tab-active' : ''}`}
                  onClick={() => setPreviewType(t)}
                >
                  {t === 'brb' ? 'BRB' : t === 'short' ? 'Short' : 'Lunch'}
                </button>
              ))}
            </div>
            <div className="btc-preview-wrap">
              <PreviewTicket type={previewType} style={style} />
            </div>
            <div className="btc-preset-desc">
              {PRESETS.find(p => p.id === style.preset)?.desc || ''}
            </div>
          </div>
        </div>

        <div className="bm-modal-row" style={{ padding: '12px 20px 20px', gap: 8 }}>
          <button className="bm-btn bm-btn-primary" onClick={handleApply}>Toepassen</button>
          <button className="bm-btn bm-btn-ghost" onClick={onClose}>Annuleren</button>
          <button className="bm-btn bm-btn-ghost" style={{ marginLeft: 'auto' }}
            onClick={() => setStyle({ ...DEFAULT_TICKET_STYLE })}>
            Standaard herstellen
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
