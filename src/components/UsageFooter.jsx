import { useState, useCallback } from 'react';
import { APP_VERSION } from '../lib/version';

const FOOD_EMOJIS = ['🥪','🍔','🍕','🌯','🍝','🧃','☕','🫖','🥛','🍜','🥗','🌮','🍱','🧁','🍩','🍎','🥐','🍞','🥨','🧀'];

function EasterEgg() {
  const [particles, setParticles] = useState([]);
  const [clicks, setClicks] = useState(0);

  const spawn = useCallback(() => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Every 5 clicks → big burst; otherwise single emoji
    const count = newClicks % 5 === 0 ? 12 : 1;
    const now = Date.now();

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: now + i,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      x: 20 + Math.random() * 60,           // % from left
      size: 28 + Math.floor(Math.random() * 28), // 28–56px
      dur: 2.5 + Math.random() * 2,          // 2.5–4.5s
      sway: (Math.random() - 0.5) * 120,     // horizontal drift
      delay: i * 80,                          // stagger ms
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up after longest animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 5000);
  }, [clicks]);

  return (
    <>
      {/* Floating emojis — rendered at fixed position over entire viewport */}
      {particles.map(p => (
        <span key={p.id} style={{
          position: 'fixed',
          left: `${p.x}%`,
          bottom: '48px',
          fontSize: `${p.size}px`,
          lineHeight: 1,
          pointerEvents: 'none',
          zIndex: 9999,
          animationName: 'bm-easter-float',
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}ms`,
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          '--sway': `${p.sway}px`,
          userSelect: 'none',
        }}>
          {p.emoji}
        </span>
      ))}

      {/* Version pill */}
      <button
        className="bm-version-pill"
        onClick={spawn}
        title="🍽️"
        style={{ cursor: 'pointer' }}
      >
        {APP_VERSION}
      </button>
    </>
  );
}

export function UsageFooter({ myUsage, config, extraBreaks = 0 }) {
  return (
    <footer className="bm-footer">
      Vandaag: <b>{myUsage.short}</b>/{config.shortPerDay + extraBreaks} kort ·{' '}
      <b>{myUsage.lunch}</b>/{config.lunchPerDay} lunch · BRB onbeperkt
      <EasterEgg />
    </footer>
  );
}
