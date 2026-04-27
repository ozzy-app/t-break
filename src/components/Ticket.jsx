export function Ticket({ type, onClick, disabled, stubTop, stubBot, useDash, ticketLabel }) {
  return (
    <button
      className={`t-ticket t-portrait t-col-${type} ${disabled ? 't-disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {type === 'short' ? (
        /* SHORT — split ticket: top red, bottom white */
        <>
          <div className="t-body t-body-top">
            <div className="t-brand t-brand-inv">T-BREAK</div>
          </div>
          <div className="t-perf-h t-perf-h-split">
            <span className="t-hole t-hole-l" />
            <span className="t-hole t-hole-r" />
          </div>
          <div className="t-body t-body-bot">
            <div className="t-type t-type-dark">{ticketLabel}</div>
            <div className="t-stub t-stub-inline">
              <div className="t-stub-top t-stub-top-dark">{stubTop}</div>
              <div className="t-stub-bot t-stub-bot-dark">{stubBot}</div>
            </div>
          </div>
        </>
      ) : (
        /* BRB (outline) and LUNCH (solid) — standard layout */
        <>
          <div className="t-body">
            <div className="t-brand">T-BREAK</div>
            <div className="t-type">{useDash ? `— ${ticketLabel}` : ticketLabel}</div>
          </div>
          <div className="t-perf-h">
            <span className="t-hole t-hole-l" />
            <span className="t-hole t-hole-r" />
          </div>
          <div className="t-stub">
            <div className="t-stub-top">{stubTop}</div>
            <div className="t-stub-bot">{stubBot}</div>
          </div>
        </>
      )}
    </button>
  );
}

export function QueueTicket({ queueLength, isMeQueued, myPosition, hasOffer, onClick, disabled, disabledReason }) {
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
    >
      {/* QUEUE — split ticket: top green, bottom white (mirrors short layout) */}
      <div className="t-body t-body-top t-body-top-queue">
        <div className="t-brand t-brand-inv">T-BREAK</div>
        <div className="t-type t-type-queue-top">— QUEUE</div>
      </div>
      <div className="t-perf-h t-perf-h-split t-perf-h-queue">
        <span className="t-hole t-hole-l" />
        <span className="t-hole t-hole-r" />
      </div>
      <div className="t-body t-body-bot t-body-bot-queue">
        <div className="t-hint t-hint-queue">{hint}</div>
        <div className="t-stub t-stub-inline">
          <div className="t-stub-top t-stub-top-queue">{stubTop}</div>
          <div className="t-stub-bot t-stub-bot-queue">{stubBot}</div>
        </div>
      </div>
    </button>
  );
}
