import React from 'react';
import useMateriaStatus from './useMateriaStatus';
import styles from './PageStatusBar.css';

// The message window along the bottom of the screen.
function PageStatusBar() {
  const { headline, detail, hasProblem } = useMateriaStatus();

  return (
    <div className={styles.statusBar}>
      <span className={hasProblem ? styles.warning : undefined}>
        {headline}. {detail}
      </span>
    </div>
  );
}

export default PageStatusBar;
