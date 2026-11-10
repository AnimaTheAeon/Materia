import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import styles from './PageTimeBox.css';

function pad(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

function formatUptime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// The "Time" box from the FFVII menu: server uptime and equipped indexers.
function PageTimeBox() {
  const startTime = useSelector(
    (state: AppState) => state.system.status.item?.startTime
  );
  const indexers = useSelector((state: AppState) => state.indexers.items);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const uptime = startTime
    ? formatUptime(now - moment(startTime).valueOf())
    : '--:--:--';
  const equipped = indexers.filter((indexer) => indexer.enable).length;

  return (
    <div className={styles.timeBox}>
      <div className={styles.row}>
        <span className={styles.label}>Time</span>
        <span>{uptime}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Materia</span>
        <span>{equipped}</span>
      </div>
    </div>
  );
}

export default PageTimeBox;
