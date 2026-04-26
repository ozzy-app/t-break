import { useCallback, useRef, useState } from 'react';

// Default column widths in px — matches the fixed grid in globals.css
const DEFAULT_WIDTHS = [110, 140, 999, 52, 80, 80, 68, 50, 50, 52];
// 999 = the 1fr column (log text) — treated specially

const COL_LABELS = ['Team', 'Naam', 'Logtekst', 'Type', 'Status', 'Eindstatus', 'Overtijd', 'Start', 'Einde', 'Tijd'];
const MIN_WIDTH = 36;

export function useResizableCols() {
  const [widths, setWidths] = useState(DEFAULT_WIDTHS);
  const dragging = useRef(null);

  const onMouseDown = useCallback((colIndex, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widths[colIndex];
    dragging.current = colIndex;
    // Columns after the 1fr (index > 2) have their handle on the left edge,
    // so dragging right should shrink and dragging left should grow (inverted).
    const isAfterFlex = colIndex > 2;

    const onMove = (ev) => {
      const raw = ev.clientX - startX;
      const delta = isAfterFlex ? -raw : raw;
      setWidths(prev => {
        const next = [...prev];
        next[colIndex] = Math.max(MIN_WIDTH, startWidth + delta);
        return next;
      });
    };
    const onUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [widths]);

  // Build a grid-template-columns string from widths
  // Column 2 (index 2) is the flex 1fr column
  const gridTemplate = widths.map((w, i) => i === 2 ? '1fr' : `${w}px`).join(' ');

  return { widths, gridTemplate, onMouseDown, labels: COL_LABELS };
}

export function LogHeader({ widths, gridTemplate, onMouseDown }) {
  return (
    <div className="bm-log-header" style={{ gridTemplateColumns: gridTemplate }}>
      {COL_LABELS.map((label, i) => {
        const isAfterFlex = i > 2;
        return (
          <div key={i} className="bm-log-header-cell">
            {isAfterFlex && i < COL_LABELS.length && (
              <div
                className="bm-col-resize-handle bm-col-resize-handle-left"
                onMouseDown={(e) => onMouseDown(i, e)}
                title="Sleep om kolom te verbreden"
              />
            )}
            <span>{label}</span>
            {!isAfterFlex && i < COL_LABELS.length - 1 && (
              <div
                className="bm-col-resize-handle"
                onMouseDown={(e) => onMouseDown(i, e)}
                title="Sleep om kolom te verbreden"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
