// Box of X: opening a page from home gently grows and dims the big orb while
// the screen fades through dark green, then the page fades in. BACK plays it
// in reverse. Kept slow and dark on purpose: no bright flash.

const ZOOM_MS = 900;
const REVEAL_MS = 700;
const ORB_GROW = 1.6;
const SHADE = '#041c04';
const EASE_IN = 'cubic-bezier(.4, 0, .6, 1)';
const EASE_OUT = 'cubic-bezier(.33, 1, .68, 1)';

let busy = false;
let pendingOut = false;

function calm() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function glowLayer(): HTMLElement {
  let glow = document.getElementById('boxofx-zoom');

  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'boxofx-zoom';
    Object.assign(glow.style, {
      position: 'fixed',
      inset: '0',
      background: SHADE,
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(glow);
  }

  return glow;
}

function stop(element: Element) {
  element.getAnimations().forEach((a) => a.cancel());
}

/** The big orb on the home screen (marked with data-big-orb). */
export function findOrb() {
  return document.querySelector<HTMLElement>('[data-big-orb]');
}

/** Zoom into the orb, then `open` the page, then fade it in. */
export function zoomIntoOrb(open: () => void) {
  if (busy) {
    return;
  }

  const orb = findOrb();

  if (!orb || calm()) {
    open();
    return;
  }

  busy = true;
  const glow = glowLayer();

  orb.animate(
    [
      { scale: '1', opacity: 1 },
      { scale: String(ORB_GROW), opacity: 0.3 },
    ],
    {
      duration: ZOOM_MS,
      easing: EASE_IN,
      fill: 'forwards',
    }
  );
  glow
    .animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], {
      duration: ZOOM_MS,
      easing: 'ease-in',
      fill: 'forwards',
    })
    .finished.then(() => {
      stop(orb);
      open();
      stop(glow);

      return glow.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: REVEAL_MS,
        easing: 'ease-out',
        fill: 'forwards',
      }).finished;
    })
    .finally(() => {
      busy = false;
    });
}

/**
 * BACK: the page sinks into the glow, then `goHome` shows the home screen.
 * Call zoomOutOfOrb() once the home screen (and its orb) is on screen.
 */
export function sinkIntoGlow(goHome: () => void) {
  if (busy) {
    return;
  }

  if (calm()) {
    goHome();
    return;
  }

  busy = true;
  pendingOut = true;
  const glow = glowLayer();

  stop(glow);
  glow
    .animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: REVEAL_MS,
      easing: 'ease-in',
      fill: 'forwards',
    })
    .finished.then(goHome, goHome);
}

/** After sinkIntoGlow's goHome: the orb settles back to its normal size. */
export function zoomOutOfOrb() {
  if (!pendingOut) {
    return;
  }

  pendingOut = false;
  const glow = glowLayer();
  const orb = findOrb();

  if (orb) {
    orb.animate(
      [
        { scale: String(ORB_GROW), opacity: 0.3 },
        { scale: '1', opacity: 1 },
      ],
      {
        duration: ZOOM_MS,
        easing: EASE_OUT,
      }
    );
  }

  stop(glow);
  glow
    .animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: ZOOM_MS,
      easing: 'ease-out',
      fill: 'forwards',
    })
    .finished.finally(() => {
      busy = false;
    });
}
