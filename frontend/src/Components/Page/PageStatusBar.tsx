import React from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import styles from './PageStatusBar.css';

// The message window along the bottom of the screen.
function PageStatusBar() {
  const indexers = useSelector((state: AppState) => state.indexers.items);
  const health = useSelector(
    (state: AppState) => state.system.health?.items ?? []
  );

  const equipped = indexers.filter((indexer) => indexer.enable).length;
  const problems = health.filter(
    (item) => item.type === 'error' || item.type === 'warning'
  );

  let message = `${equipped} of ${indexers.length} indexer(s) equipped.`;

  if (problems.length) {
    message += ` ${problems[0].message}`;
  }

  return (
    <div className={styles.statusBar}>
      <span className={problems.length ? styles.warning : undefined}>
        {message}
      </span>
    </div>
  );
}

export default PageStatusBar;
