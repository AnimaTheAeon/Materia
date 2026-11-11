import classNames from 'classnames';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { sinkIntoGlow, zoomIntoOrb, zoomOutOfOrb } from './orbZoom';
import styles from './GreenFrame.css';

interface MenuLink {
  title: () => string;
  to: string;
  alias?: string;
  children?: MenuLink[];
}

const links = pageLinks as MenuLink[];

// How far each home-menu node sits from the orb, so the column bows around it.
const ARC = [0, 40, 58, 40, 0];

interface GreenFrameProps {
  location: { pathname: string };
  children: ReactNode;
}

function sectionIndex(pathname: string) {
  const parent = getActiveParent(pathname);
  const index = links.findIndex((link) => link.to === parent);

  return index < 0 ? 0 : index;
}

function isTyping() {
  const el = document.activeElement as HTMLElement | null;

  if (!el) {
    return false;
  }

  const tag = el.tagName;

  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

// Pop-up windows (modals) live in #portal-root. Drop-down menus are parked there
// too even when closed, so look for an actual modal.
function isPopupOpen() {
  return !!document.querySelector(
    `#portal-root .${modalStyles.modalContainer}`
  );
}

function Background({ home }: { home: boolean }) {
  const cx = home ? 420 : 140;
  const cy = home ? 380 : 120;

  return (
    <div
      className={classNames(styles.background, home && styles.homeBackground)}
    >
      <svg
        className={styles.grid}
        viewBox="0 0 1280 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="rgba(120,220,60,0.13)" strokeWidth="1.4">
          <ellipse cx={cx} cy={cy} rx="300" ry="280" />
          <ellipse cx={cx} cy={cy} rx="470" ry="430" />
          <ellipse cx={cx} cy={cy} rx="660" ry="600" />
          <ellipse cx={cx} cy={cy} rx="880" ry="790" />
          <line x1={cx} y1={cy} x2="-200" y2="-300" />
          <line x1={cx} y1={cy} x2={cx} y2="-400" />
          <line x1={cx} y1={cy} x2="1100" y2="-300" />
          <line x1={cx} y1={cy} x2="1600" y2="250" />
          <line x1={cx} y1={cy} x2="1500" y2="1100" />
          <line x1={cx} y1={cy} x2={cx} y2="1200" />
          <line x1={cx} y1={cy} x2="-400" y2="1100" />
          <line x1={cx} y1={cy} x2="-500" y2={cy} />
        </g>
      </svg>
    </div>
  );
}

function BigOrb() {
  return (
    <div className={styles.orbWrap} aria-hidden="true" data-big-orb={true}>
      <div className={classNames(styles.shell, styles.s1)} />
      <div className={classNames(styles.shell, styles.s4)} />
      <div className={classNames(styles.shell, styles.s2)} />
      <div className={classNames(styles.shell, styles.s3)} />
      <div className={styles.gloss} />
      <div className={styles.glyph}>
        {/* Two linked materia slots, like a weapon's paired slots. */}
        <svg width="46%" height="46%" viewBox="0 0 100 100">
          <rect
            x="28"
            y="45"
            width="44"
            height="10"
            rx="3"
            fill="rgba(255,255,230,0.7)"
          />
          <circle
            cx="26"
            cy="50"
            r="18"
            fill="none"
            stroke="rgba(255,255,230,0.9)"
            strokeWidth="4"
          />
          <circle
            cx="74"
            cy="50"
            r="18"
            fill="none"
            stroke="rgba(255,255,230,0.9)"
            strokeWidth="4"
          />
          <circle cx="26" cy="50" r="11" fill="rgba(255,255,230,0.9)" />
          <circle cx="74" cy="50" r="11" fill="rgba(255,255,230,0.9)" />
          <circle cx="22.5" cy="46" r="3.2" fill="rgba(80,150,30,0.7)" />
          <circle cx="70.5" cy="46" r="3.2" fill="rgba(80,150,30,0.7)" />
        </svg>
      </div>
    </div>
  );
}

function StatusBox({ compact }: { compact?: boolean }) {
  const { headline, detail, hasError } = useMateriaStatus();

  return (
    <div className={classNames(styles.statusBox, compact && styles.compact)}>
      <span className={classNames(styles.mini, hasError && styles.miniOff)} />
      <span className={styles.statusText}>
        <span className={styles.statusTop}>{headline}</span>
        {compact ? null : <span className={styles.statusBottom}>{detail}</span>}
      </span>
    </div>
  );
}

function Hint(props: { keyName: string; label: string; onPress(): void }) {
  const { keyName, label, onPress } = props;

  return (
    <button type="button" className={styles.hint} onClick={onPress}>
      <span className={styles.hintNode}>{keyName}</span>
      <span>{label}</span>
    </button>
  );
}

interface MenuEntryProps {
  index: number;
  label: string;
  isSelected: boolean;
  onHover(index: number): void;
  onOpen(index: number): void;
}

function MenuEntry(props: MenuEntryProps) {
  const { index, label, isSelected, onHover, onOpen } = props;

  const handleMouseEnter = useCallback(() => onHover(index), [index, onHover]);
  const handleClick = useCallback(() => onOpen(index), [index, onOpen]);

  return (
    <button
      type="button"
      className={classNames(styles.item, isSelected && styles.selected)}
      style={{ marginLeft: ARC[index] ?? 0 }}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <span className={styles.node} />
      <span className={styles.wire} />
      <span className={styles.tab}>
        <i />
        <span>{label}</span>
      </span>
    </button>
  );
}

function GreenFrame({ location, children }: GreenFrameProps) {
  const history = useHistory();
  const dispatch = useDispatch();
  // Menu paths don't include the URL base, so compare without it.
  const urlBase = window.Prowlarr.urlBase;
  const pathname =
    (urlBase && location.pathname.startsWith(urlBase)
      ? location.pathname.slice(urlBase.length)
      : location.pathname) || '/';
  const current = sectionIndex(pathname);

  // Start on the home screen only when opening Materia at its front page.
  const [atHome, setAtHome] = useState(pathname === '/');
  const [cursor, setCursor] = useState(current);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const isHealthPopulated = useSelector(
    (state: AppState) => state.system.health?.isPopulated
  );

  useEffect(() => {
    // The FFVII layout loads health from its menu; Box of X has no side menu.
    if (!isHealthPopulated) {
      dispatch(fetchHealth());
    }
  }, [isHealthPopulated, dispatch]);

  const openNow = useCallback(
    (index: number) => {
      const link = links[index];

      setCursor(index);
      setAtHome(false);

      if (getActiveParent(pathname) !== link.to || pathname !== link.to) {
        history.push(`${urlBase}${link.to}`);
      }
    },
    [history, pathname, urlBase]
  );

  // From home, zoom into the orb first.
  const open = useCallback(
    (index: number) => {
      if (atHome) {
        zoomIntoOrb(() => openNow(index));
      } else {
        openNow(index);
      }
    },
    [atHome, openNow]
  );

  const goHomeNow = useCallback(() => {
    // The cursor lands on the page you just left.
    setCursor(sectionIndex(pathname));
    setAtHome(true);
  }, [pathname]);

  // BACK: the page sinks into the glow, then the orb shrinks back.
  const goHome = useCallback(() => sinkIntoGlow(goHomeNow), [goHomeNow]);

  useEffect(() => {
    if (atHome) {
      zoomOutOfOrb();
    }
  }, [atHome]);

  // Keyboard: arrows + Enter on the home screen, Esc for BACK on pages.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTyping() || isPopupOpen() || isShortcutsOpen) {
        return;
      }

      if (atHome) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          setCursor((c) => (c + 1) % links.length);
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          setCursor((c) => (c - 1 + links.length) % links.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          open(cursor);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        goHome();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [atHome, cursor, open, goHome, isShortcutsOpen]);

  // The mouse's side "back" button returns to the home screen.
  useEffect(() => {
    function onMouseUp(event: MouseEvent) {
      if (event.button !== 3) {
        return;
      }

      event.preventDefault();

      if (!atHome && !isPopupOpen()) {
        goHome();
      }
    }

    function onMouseDown(event: MouseEvent) {
      if (event.button === 3) {
        event.preventDefault();
      }
    }

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onMouseDown);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [atHome, goHome]);

  const section = links[current];
  // The section's own page comes first when it isn't one of its tabs
  // (Indexers list, Config overview), followed by its sub-pages.
  const tabs = useMemo(() => {
    const children = section.children ?? [];

    if (!children.length || children.some((c) => c.to === section.to)) {
      return children;
    }

    return [{ title: () => 'List', to: section.to }, ...children];
  }, [section]);

  const handleShortcutsOpen = useCallback(() => setIsShortcutsOpen(true), []);
  const handleShortcutsClose = useCallback(() => setIsShortcutsOpen(false), []);
  const handleSelect = useCallback(() => open(cursor), [open, cursor]);

  const actions = (
    <PageHeaderActionsMenu onKeyboardShortcutsPress={handleShortcutsOpen} />
  );

  return (
    <div className={styles.frame}>
      <Background home={atHome} />

      {atHome ? (
        <div className={styles.home}>
          <div className={styles.homeActions}>{actions}</div>

          <div className={styles.homeMain}>
            <BigOrb />

            <nav className={styles.menu} aria-label="Main menu">
              {links.map((link, index) => (
                <MenuEntry
                  key={link.to}
                  index={index}
                  label={link.title()}
                  isSelected={cursor === index}
                  onHover={setCursor}
                  onOpen={open}
                />
              ))}
            </nav>
          </div>

          <div className={styles.homeFooter}>
            <StatusBox />
            <Hint keyName="ENTER" label="SELECT" onPress={handleSelect} />
          </div>
        </div>
      ) : (
        <div className={styles.page}>
          <div className={styles.topRow}>
            <div className={styles.titleBar}>
              <span>{section.title()}</span>
            </div>
            <div className={styles.search}>
              <IndexerSearchInputConnector />
            </div>
            <StatusBox compact={true} />
            <div className={styles.actions}>{actions}</div>
          </div>

          {tabs.length ? (
            <div className={styles.tabs}>
              {tabs.map((tab) => {
                const isOverview = !section.children?.includes(tab);
                const isActive = isOverview
                  ? pathname === tab.to
                  : pathname.startsWith(tab.to);

                return (
                  <Link
                    key={tab.to}
                    className={classNames(
                      styles.subTab,
                      isActive && styles.subTabActive
                    )}
                    to={tab.to}
                  >
                    {tab.title()}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className={styles.content}>{children}</div>

          <div className={styles.footer}>
            <Hint keyName="ESC" label="BACK" onPress={goHome} />
          </div>
        </div>
      )}

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onModalClose={handleShortcutsClose}
      />
    </div>
  );
}

export default GreenFrame;
