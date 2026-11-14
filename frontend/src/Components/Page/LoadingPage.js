import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import styles from './LoadingPage.css';

// Materia's own start screen: two linked materia slots over the app's name.
// Everything fades in gently and moves slowly; nothing flashes.
const STATUS = [
  'Equipping materia',
  'Linking the slots',
  'Gathering your indexers',
  'Checking the sockets'
];

function Slot({ cx, delay }) {
  return (
    <g transform={`translate(${cx} 0)`}>
      <circle r="38" className={styles.socket}
        strokeWidth="3"
      />
      <circle r="31" className={styles.socketInner}
        strokeWidth="1"
      />
      <g className={styles.orb} style={{ animationDelay: `${delay}s` }}>
        <circle r="24" className={styles.orbBody} />
        <circle r="24" className={styles.orbShade} />
        <ellipse
          cx="-8"
          cy="-10"
          rx="9"
          ry="5.5"
          className={styles.gloss}
          transform="rotate(-35 -8 -10)"
        />
      </g>
    </g>
  );
}

Slot.propTypes = {
  cx: PropTypes.number.isRequired,
  delay: PropTypes.number.isRequired
};

function Slots() {
  return (
    <svg
      className={styles.emblem}
      viewBox="-110 -70 220 140"
      aria-hidden="true"
    >
      <g transform="rotate(-20)">
        <rect x="-22" y="-5"
          width="44" height="10"
          rx="5" className={styles.link}
        />
        <rect x="-22" y="-5"
          width="44" height="10"
          rx="5" className={styles.linkSheen}
        />
        <Slot cx={-62} delay={0} />
        <Slot cx={62} delay={2.2} />
      </g>
    </svg>
  );
}

function LoadingPage() {
  const status = useMemo(
    () => STATUS[Math.floor(Math.random() * STATUS.length)],
    []
  );

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <Slots />
        <div className={styles.title}>M A T E R I A</div>
        <div className={styles.bar}>
          <div className={styles.barGlide} />
        </div>
        <div className={styles.status}>{status}…</div>
      </div>
    </div>
  );
}

export default LoadingPage;
