// Ticket component — accepts optional ticketStyle for customized appearance
const PRESET_RADIUS = { cinema: 10, boarding: 8, minimal: 4, retro: 16, card: 20 };

function getTicketStyle(type, ticketStyle) {
  if (!ticketStyle) return {};
  const colors = ticketStyle[type] || {};
  return {
    '--t-bg': colors.bg,
    '--t-fg': colors.fg,
    borderRadius: ticketStyle.radius,
    boxShadow: ticketStyle.shadow,
    fontFamily: ticketStyle.fontFamily === 'Geist Mono' ? 'Geist Mono, monospace'
      : ticketStyle.fontFamily === 'Geist' ? 'Geist, sans-serif'
      : 'Bebas Neue, sans-serif',
  };
}

export function Ticket({ type, onClick, disabled, stubTop, stubBot, useDash, ticketLabel, ticketStyle }) {
  const customStyle = getTicketStyle(type, ticketStyle);
  const typeSize = ticketStyle?.typeSize;
  const labelSize = ticketStyle?.labelSize;
  const isBoarding = ticketStyle?.preset === 'boarding';
  const perfStyle = ticketStyle?.preset;
  const stubRatio = ticketStyle?.stubRatio || 0.32;

  if (isBoarding) {
    return (
      <button
        className={`t-ticket t-landscape t-col-${type} ${disabled ? 't-disabled' : ''}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={customStyle}
      >
        <div className="t-body-l">
          <div className="t-brand" style={labelSize ? { fontSize: labelSize } : {}}>T-BREAK</div>
          <div className="t-type" style={typeSize ? { fontSize: typeSize } : {}}>{ticketLabel}</div>
          <div className="t-stub-l-bar"><div className="t-stub-l-bar-fill" /></div>
        </div>
        <div className="t-stub-l">
          <div className="t-stub-l-top">{stubTop}</div>
          <div className="t-stub-l-name">{stubBot}</div>
          <div className="t-stub-l-mono">{ticketLabel}</div>
        </div>
      </button>
    );
  }

  return (
    <button
      className={`t-ticket t-portrait t-col-${type} ${disabled ? 't-disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={customStyle}
    >
      <div className="t-body">
        <div className="t-brand" style={labelSize ? { fontSize: labelSize } : {}}>T-BREAK</div>
        <div className="t-type" style={typeSize ? { fontSize: typeSize } : {}}>{useDash ? `— ${ticketLabel}` : ticketLabel}</div>
      </div>
      <div className="t-perf-h">
        <span className="t-hole t-hole-l" />
        <span className="t-hole t-hole-r" />
      </div>
      <div className="t-stub" style={{ height: `${Math.round(stubRatio * 204)}px` }}>
        <div className="t-stub-top">{stubTop}</div>
        <div className="t-stub-bot">{stubBot}</div>
      </div>
    </button>
  );
}

export function QueueTicket({ queueLength, isMeQueued, myPosition, hasOffer, onClick, disabled, disabledReason, ticketStyle }) {
  const customStyle = getTicketStyle('brb', ticketStyle);
  const typeSize = ticketStyle?.typeSize;
  const labelSize = ticketStyle?.labelSize;
  const stubRatio = ticketStyle?.stubRatio || 0.32;
  let stubTop, stubBot, hint;
  if (hasOffer) { stubTop = '↑'; stubBot = 'CLAIM HIERBOVEN'; hint = 'ticket beschikbaar'; }
  else if (isMeQueued) { stubTop = `#${myPosition}`; stubBot = 'TIK OM TE VERLATEN'; hint = 'in wachtrij'; }
  else { stubTop = String(queueLength); stubBot = 'WACHTEN'; hint = 'tik om aan te sluiten'; }
  return (
    <button
      className={`t-ticket t-portrait t-col-queue ${disabled ? 't-disabled' : ''} ${hasOffer ? 't-offer-pulse' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? disabledReason : ''}
      style={ticketStyle ? { ...customStyle, '--t-bg': 'var(--t-queue-bg)', '--t-fg': 'var(--t-queue-fg)', borderRadius: ticketStyle.radius, boxShadow: ticketStyle.shadow } : {}}
    >
      <div className="t-body">
        <div className="t-brand" style={labelSize ? { fontSize: labelSize } : {}}>T-BREAK</div>
        <div className="t-type" style={typeSize ? { fontSize: typeSize } : {}}>— QUEUE</div>
        <div className="t-hint">{hint}</div>
      </div>
      <div className="t-perf-h">
        <span className="t-hole t-hole-l" />
        <span className="t-hole t-hole-r" />
      </div>
      <div className="t-stub" style={{ height: `${Math.round(stubRatio * 204)}px` }}>
        <div className="t-stub-top">{stubTop}</div>
        <div className="t-stub-bot">{stubBot}</div>
      </div>
    </button>
  );
}
