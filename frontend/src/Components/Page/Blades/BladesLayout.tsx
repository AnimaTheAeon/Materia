import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AppState from 'App/State/AppState';
import Link from 'Components/Link/Link';
import modalStyles from 'Components/Modal/Modal.css';
import IndexerSearchInputConnector from 'Components/Page/Header/IndexerSearchInputConnector';
import KeyboardShortcutsModal from 'Components/Page/Header/KeyboardShortcutsModal';
import PageHeaderActionsMenu from 'Components/Page/Header/PageHeaderActionsMenu';
import {
  getActiveParent,
  pageLinks,
} from 'Components/Page/Sidebar/PageSidebar';
import { fetchHealth } from 'Store/Actions/systemActions';
import useMateriaStatus from '../useMateriaStatus';
import styles from './Blades.css';

// Materia: the "Blades" layout (same look as Lifestream, Jenova, Turks and
// Midgar). One glossy silver blade per menu section; the open one wears its
// color and holds the page, with the section's pages as glass tabs. Click a
// blade, use Left/Right, drag a tab or the top band sideways, or the arrow
// buttons. Esc goes back to the first section; the mouse's back button steps
// back a blade.

interface NavLink {
  title: () => string;
  to: string;
  alias?: string;
  isAdvanced?: boolean;
  children?: NavLink[];
  statusComponent?: React.ElementType;
  exact?: boolean;
}

const sections = pageLinks as NavLink[];

// Panel top-left, middle, bottom-right, and the darker bands.
const COLORS = [
  ['#3479c0', '#245f9c', '#1c4f85', '#133a63'],
  ['#c27416', '#9d560b', '#864807', '#5e3204'],
  ['#4a9a32', '#357a22', '#2a6619', '#1f4c12'],
  ['#8064b4', '#674c9c', '#583f8a', '#3d2a63'],
  ['#c4403a', '#a02c28', '#88201e', '#5c1412'],
];

function stripUrlBase(pathname: string) {
  const urlBase = window.Prowlarr.urlBase;

  return urlBase ? pathname.substr(urlBase.length) || '/' : pathname;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;

  if (!el || !el.tagName) {
    return false;
  }

  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT'
  );
}

// Pop-up windows (modals) live in #portal-root. Drop-down menus are parked
// there too even when closed, so look for an actual modal.
function isPopupOpen() {
  return !!document.querySelector(
    `#portal-root .${modalStyles.modalContainer}`
  );
}

function isTabActive(tab: NavLink, pathname: string) {
  if (tab.to === '/') {
    return pathname === '/';
  }

  if (tab.exact) {
    return pathname === tab.to;
  }

  return pathname === tab.to || pathname.startsWith(`${tab.to}/`);
}

// The section's own page comes first when it isn't one of its tabs
// (Indexers list, Config overview), followed by its sub-pages.
function sectionTabs(section: NavLink) {
  const children = section.children ?? [];

  if (!children.length || children.some((child) => child.to === section.to)) {
    return children;
  }

  return [{ title: () => 'List', to: section.to }, ...children];
}

function useWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

const calm = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Arrow({ d }: { d: string }) {
  return (
    <svg aria-hidden={true} width="16" height="16" viewBox="0 0 16 16">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusChip() {
  const { headline, detail, hasProblem, hasError } = useMateriaStatus();
  let kind: 'good' | 'warn' | 'bad' = 'good';
  let title = 'All good';

  if (hasError) {
    kind = 'bad';
    title = 'Problem';
  } else if (hasProblem) {
    kind = 'warn';
    title = 'Needs a look';
  }
  const text = `${headline} · ${detail}`;

  return (
    <>
      <Link className={styles.chip} to="/system/status" title={text}>
        <span
          className={classNames(
            styles.dot,
            kind === 'warn' && styles.warn,
            kind === 'bad' && styles.bad
          )}
        />
        {title}
      </Link>

      <span className={styles.statusText} title={text}>
        {text}
      </span>
    </>
  );
}

interface BladesLayoutProps {
  location: { pathname: string };
  children: React.ReactNode;
}

function BladesLayout({ location, children }: BladesLayoutProps) {
  const history = useHistory();
  const pathname = stripUrlBase(location.pathname);
  const dispatch = useDispatch();
  const isHealthPopulated = useSelector(
    (state: AppState) => state.system.health?.isPopulated
  );

  useEffect(() => {
    // The FFVII layout loads health from its menu; Blades has no side menu.
    if (!isHealthPopulated) {
      dispatch(fetchHealth());
    }
  }, [isHealthPopulated, dispatch]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [instant, setInstant] = useState(true);
  const width = useWidth();
  const drag = useRef<{ x: number; y: number; ok: boolean } | null>(null);

  const go = useCallback(
    (to: string) => history.push(`${window.Prowlarr.urlBase}${to}`),
    [history]
  );

  const n = sections.length;
  const activeTo = getActiveParent(pathname);
  const cur = Math.max(
    0,
    sections.findIndex((section) => section.to === activeTo)
  );

  // No slide on the first frame.
  useEffect(() => {
    const id = window.setTimeout(() => setInstant(false), 50);

    return () => window.clearTimeout(id);
  }, []);

  const step = useCallback(
    (d: number) => {
      const j = Math.max(0, Math.min(n - 1, cur + d));

      if (j !== cur) {
        go(sections[j].to);
      }
    },
    [cur, n, go]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isTyping(event.target) ||
        isPopupOpen()
      ) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        step(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === 'Escape') {
        if (cur > 0) {
          go(sections[0].to);
        }
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button !== 3) {
        return;
      }

      event.preventDefault();

      if (isPopupOpen()) {
        return;
      }

      step(-1);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 3) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onMouseDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [cur, go, step]);

  // Swipe sideways: anywhere with a finger, or from a tab or the top band with the mouse.
  const onPointerDown = useCallback((event: React.PointerEvent) => {
    const target = event.target as HTMLElement;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      ok:
        event.pointerType === 'touch' ||
        !!target.closest(`.${styles.tab}, .${styles.band}`),
    };
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const d = drag.current;
      drag.current = null;

      if (!d || !d.ok) {
        return;
      }

      const dx = event.clientX - d.x;
      const dy = event.clientY - d.y;

      if (Math.abs(dx) > 70 && Math.abs(dy) < 60) {
        step(dx < 0 ? 1 : -1);
      }
    },
    [step]
  );

  const narrow = width < 700;
  const p = narrow ? 30 : 52;
  const r = narrow ? 20 : 44;
  const edge = narrow ? 14 : 30;
  const ms = instant || calm() ? 0 : 700;
  const stageStyle = {
    '--p': `${p}px`,
    '--r': `${r}px`,
    '--edge': `${edge}px`,
    '--bw': `${width - edge - (n - 1) * p + r}px`,
    '--ms': `${ms}ms`,
  } as React.CSSProperties;
  const section = sections[cur];
  const tabs = sectionTabs(section);
  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);
  const onTabClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const to = event.currentTarget.dataset.to;

      if (to && to !== sections[cur].to) {
        go(to);
      }
    },
    [cur, go]
  );
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  return (
    <div
      className={styles.stage}
      style={stageStyle}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {sections.map((s, i) => {
        const open = i === cur;
        const [c0, c1, c2, band] = COLORS[i % COLORS.length];
        const x = i <= cur ? i * p : width - edge - (n - i) * p;

        return (
          <section
            key={s.to}
            className={classNames(styles.blade, open && styles.open)}
            aria-label={s.title()}
            style={
              {
                transform: `translateX(${x}px)`,
                zIndex: 10 + i,
                '--c0': c0,
                '--c1': c1,
                '--c2': c2,
                '--band': band,
              } as React.CSSProperties
            }
          >
            <button
              className={styles.tab}
              type="button"
              aria-label={s.title()}
              tabIndex={open ? -1 : 0}
              data-to={s.to}
              onClick={onTabClick}
            >
              <span className={styles.label}>{s.title().toLowerCase()}</span>
            </button>

            <div className={styles.wrap} aria-hidden={!open}>
              <div className={styles.panel}>
                <div className={styles.band}>
                  <h1 className={styles.title}>{s.title()}</h1>

                  {open ? (
                    <>
                      <div className={styles.search}>
                        <IndexerSearchInputConnector />
                      </div>

                      <StatusChip />

                      <div className={styles.actions}>
                        <PageHeaderActionsMenu
                          onKeyboardShortcutsPress={openShortcuts}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                {open && tabs.length > 1 ? (
                  <nav className={styles.subtabs} aria-label={s.title()}>
                    {tabs.map((tab) => {
                      const Status = tab.statusComponent;

                      return (
                        <Link
                          key={tab.to}
                          className={classNames(
                            styles.subtab,
                            isTabActive(tab, pathname) && styles.subtabOn
                          )}
                          to={tab.to}
                        >
                          <span>{tab.title()}</span>
                          {Status ? <Status /> : null}
                        </Link>
                      );
                    })}
                  </nav>
                ) : null}

                <div className={styles.body}>
                  {open ? (
                    <div className={styles.bodyInner}>{children}</div>
                  ) : null}
                </div>

                <div className={styles.foot}>
                  <span className={classNames(styles.key, styles.hint)}>
                    ← →
                  </span>
                  <span className={styles.hint}>Blades</span>
                  <span className={classNames(styles.key, styles.hint)}>
                    ESC
                  </span>
                  <span className={styles.hint}>Back</span>

                  <div className={styles.messages} />

                  <span className={styles.navs}>
                    <button
                      className={styles.nav}
                      type="button"
                      aria-label="Previous blade"
                      disabled={cur === 0}
                      onClick={prev}
                    >
                      <Arrow d="M10 3 L5 8 L10 13" />
                    </button>
                    <button
                      className={styles.nav}
                      type="button"
                      aria-label="Next blade"
                      disabled={cur === n - 1}
                      onClick={next}
                    >
                      <Arrow d="M6 3 L11 8 L6 13" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <div className={styles.edge} aria-hidden={true} />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onModalClose={closeShortcuts}
      />
    </div>
  );
}

export default BladesLayout;
