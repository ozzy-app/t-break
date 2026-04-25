import { APP_VERSION } from '../lib/version';

export function UsageFooter({ myUsage, config, extraBreaks = 0 }) {
  return (
    <footer className="bm-footer">
      Vandaag: <b>{myUsage.short}</b>/{config.shortPerDay + extraBreaks} kort ·{' '}
      <b>{myUsage.lunch}</b>/{config.lunchPerDay} lunch · BRB onbeperkt
      <span className="bm-version">{APP_VERSION}</span>
    </footer>
  );
}
