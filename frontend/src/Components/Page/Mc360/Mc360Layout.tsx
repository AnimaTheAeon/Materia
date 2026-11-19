import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AppState from 'App/State/AppState';
import modalStyles from 'Components/Modal/Modal.css';
import IndexerSearchInputConnector from 'Components/Page/Header/IndexerSearchInputConnector';
import KeyboardShortcutsModal from 'Components/Page/Header/KeyboardShortcutsModal';
import PageHeaderActionsMenu from 'Components/Page/Header/PageHeaderActionsMenu';
import {
  getActiveParent,
  pageLinks,
} from 'Components/Page/Sidebar/PageSidebar';
import { saveUISettings, setUISettingsValue } from 'Store/Actions/Settings/ui';
import { fetchHealth, fetchUpdates } from 'Store/Actions/systemActions';
import useMateriaStatus from '../useMateriaStatus';
import styles from './Mc360.css';

// Materia: the "MC360" look. Skin blades from the MC360 dashboard, one per menu
// section; each blade's menu lists that section's pages. Pick one and the page
// opens on the blade, exactly as it is in every other look. The drawing,
// sounds and keys come from the shared MC360 engine (Content/MC360).

interface NavLink {
  title: () => string;
  to: string;
  alias?: string;
  isAdvanced?: boolean;
  children?: NavLink[];
  exact?: boolean;
}

interface EngineItem {
  id: string;
  label: string;
  icon: string;
  hint: string;
}

interface Engine {
  host: HTMLElement;
  showPage: (blade: number, id: string) => void;
  home: (blade?: number) => void;
  refresh: () => void;
  toast: (title: string, text: string) => void;
  setBlades: (blades: unknown[]) => void;
  state: () => { tier: number; b: number };
  destroy: () => void;
}

declare global {
  interface Window {
    MC360?: { mount: (options: unknown) => Engine };
  }
}

const sections = pageLinks as NavLink[];

// setUISettingsValue comes from a JS action creator, so describe its payload here.
const setUISetting = setUISettingsValue as unknown as (payload: {
  name: string;
  value: string;
}) => { type: string };

const LOOKS: Record<string, string> = {
  'FFVII Menu': 'materia',
  Xbox: 'green',
  Blades: 'blades',
  'Dark Glass': 'glass',
  MC360: 'mc360',
};

const COLORS = ['blue', 'orange', 'green', 'purple', 'grey'];

const PAGES: Record<string, [string, string]> = {
  '/': ['list', 'Add, edit, test and sync.'],
  '/indexers/stats': ['gauge', 'How each site performs.'],
  '/search': ['search', 'Search every indexer at once.'],
  '/history': ['clock', 'Every query and grab.'],
  '/settings/applications': ['apps', 'Midgar and Turks.'],
  '/settings/downloadclients': ['plug', 'Lifestream.'],
  '/settings/indexers': ['shield', 'DeBarrier for Cloudflare sites.'],
  '/settings/connect': ['bell', 'Where alerts go.'],
  '/settings/tags': ['tag', 'Tags and what uses them.'],
  '/settings/general': ['gear', 'Port, sign-in, backups.'],
  '/settings/ui': ['palette', 'Look, sounds and motion.'],
  '/system/status': ['info', 'Health checks and versions.'],
  '/system/tasks': ['task', 'Scheduled jobs, with Run now.'],
  '/system/backup': ['disk', 'Make and restore backups.'],
  '/system/updates': ['refresh', 'Check now and Update now.'],
  '/system/events': ['bell', 'What the app has been doing.'],
  '/system/logs/files': ['doc', 'Read and download log files.'],
};

function stripUrlBase(pathname: string) {
  const urlBase = window.Prowlarr.urlBase;

  return urlBase ? pathname.substr(urlBase.length) || '/' : pathname;
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

// The section's own page comes first when it isn't one of its pages
// (the Indexers list), followed by its other pages.
function sectionTabs(section: NavLink) {
  const children = section.children ?? [];

  if (!children.length) {
    return [{ title: section.title, to: section.to }];
  }

  if (children.some((child) => child.to === section.to)) {
    return children;
  }

  return [{ title: section.title, to: section.to }, ...children];
}

function bladesFor() {
  return sections.map((section, i) => ({
    key: section.title().toLowerCase(),
    color: COLORS[i % COLORS.length],
    items: sectionTabs(section).map((tab): EngineItem => {
      const [icon, hint] = PAGES[tab.to] ?? [
        'gear',
        `${tab.title()} settings.`,
      ];

      return { id: tab.to, label: tab.title(), icon, hint };
    }),
  }));
}

// Where the current address sits: the blade, and the menu entry it belongs to.
function locate(pathname: string) {
  const path = pathname;
  const parent = getActiveParent(path);
  const b = Math.max(
    0,
    sections.findIndex((section) => section.to === parent)
  );
  const tabs = sectionTabs(sections[b]);
  const hits = tabs.filter((tab) => isTabActive(tab, path));
  const tab = hits[hits.length - 1] ?? tabs[0];

  return { b, id: tab.to };
}

// Pop-up windows (modals) live in #portal-root. Drop-down menus are parked
// there too even when closed, so look for an actual modal.
function isPopupOpen() {
  return !!document.querySelector(
    `#portal-root .${modalStyles.modalContainer}`
  );
}

function loadOnce(id: string, make: () => HTMLElement) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      if (window.MC360 || id.endsWith('css')) {
        resolve();
      } else {
        document.getElementById(id)?.addEventListener('load', () => resolve());
      }
      return;
    }

    const element = make();
    element.id = id;
    element.addEventListener('load', () => resolve());
    element.addEventListener('error', () => reject());
    document.head.appendChild(element);
  });
}

// The server lets browsers keep /Content files for a year, so the engine's
// address carries the app version: an update always loads the new engine.
function loadEngine(base: string) {
  const v = encodeURIComponent(window.Prowlarr.version || '');
  const css = loadOnce('mc360-css', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base}mc360.css?v=${v}`;
    return link;
  });
  const js = loadOnce('mc360-js', () => {
    const script = document.createElement('script');
    script.src = `${base}mc360.js?v=${v}`;
    return script;
  });

  return Promise.all([css, js]);
}

interface Mc360LayoutProps {
  location: { pathname: string };
  children: React.ReactNode;
}

function Mc360Layout({ location, children }: Mc360LayoutProps) {
  const history = useHistory();
  const dispatch = useDispatch();
  const pathname = stripUrlBase(location.pathname);
  const store = useStore<AppState>();
  const { headline, detail } = useMateriaStatus();
  const text = `${headline} · ${detail}`;
  const isHealthPopulated = useSelector(
    (state: AppState) => state.system.health?.isPopulated
  );
  const { authentication, isWindows } = useSelector(
    (state: AppState) => state.system.status.item
  );
  const [engine, setEngine] = useState<Engine | null>(null);
  const [failed, setFailed] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const live = useRef({
    pathname,
    text,
    formsAuth: false,
    isWindows: false,
  });
  const formsAuth = authentication === 'forms';
  live.current = { pathname, text, formsAuth, isWindows };

  // Sign-in and platform arrive with the system status, after the engine may
  // have started; the engine reads these options each time it draws.
  const optionsRef = useRef<{
    app: { plat: string };
    signOut: (() => void) | undefined;
  } | null>(null);
  const applyStatus = useCallback(() => {
    const options = optionsRef.current;

    if (!options) {
      return;
    }

    options.app.plat = live.current.isWindows ? 'Windows' : 'NAS';
    options.signOut = live.current.formsAuth
      ? () => {
          window.location.href = `${window.Prowlarr.urlBase}/logout`;
        }
      : undefined;
  }, []);

  const go = useCallback(
    (to: string) => history.push(`${window.Prowlarr.urlBase}${to}`),
    [history]
  );

  // Start the engine once; it stays for as long as this look is on.
  useEffect(() => {
    let mc: Engine | null = null;
    let gone = false;
    const base = `${window.Prowlarr.urlBase}/Content/MC360/`;

    loadEngine(base).then(
      () => {
        if (gone || !window.MC360) {
          return;
        }

        const version = window.Prowlarr.version;

        const options = {
          base,
          app: {
            name: 'Materia',
            plat: live.current.isWindows ? 'Windows' : 'NAS',
            ver: version,
            icon: 'gem',
          },
          blades: bladesFor(),
          card: () => live.current.text.split(' · '),
          onOpen: (_b: number, item: EngineItem) => {
            if (item.id !== live.current.pathname) {
              go(item.id);
            }
          },
          popupOpen: isPopupOpen,
          looks: Object.keys(LOOKS),
          setLook: (look: string) => {
            dispatch(setUISetting({ name: 'theme', value: LOOKS[look] }));
            dispatch(saveUISettings());
          },
          // Asks the update server again, like Check now on Updates.
          checkUpdates: async () => {
            dispatch(fetchUpdates());

            for (let i = 0; i < 100; i++) {
              await new Promise((resolve) => setTimeout(resolve, 150));
              const updates = store.getState().system.updates;

              if (i > 2 && !updates.isFetching) {
                if (updates.error) {
                  return 'Couldn\u2019t reach the update server';
                }

                const newer = updates.items.find(
                  (update) => update.installable && !update.installed
                );

                if (newer) {
                  go('/system/updates');
                  return `Version ${newer.version} is ready on Updates`;
                }

                return `Materia ${version} is the newest version`;
              }
            }

            return 'Still checking: see System > Updates';
          },
          signOut: undefined as (() => void) | undefined,
        };
        optionsRef.current = options;
        applyStatus();
        mc = window.MC360.mount(options);

        // Start on the menu of the blade the current page belongs to (the
        // look switch happens on Settings > UI); Enter opens the page.
        const { b } = locate(live.current.pathname);

        mc.home(b);

        setEngine(mc);
      },
      () => setFailed(true)
    );

    return () => {
      gone = true;
      mc?.destroy();
    };
  }, [dispatch, go, applyStatus, store]);

  // The FFVII layout loads health from its menu; this look has no side menu.
  useEffect(() => {
    if (!isHealthPopulated) {
      dispatch(fetchHealth());
    }
  }, [isHealthPopulated, dispatch]);

  useEffect(() => {
    applyStatus();
    engine?.refresh();
  }, [engine, applyStatus, formsAuth, isWindows]);

  // The page changed (a link, the address bar, a show opened): follow it.
  const first = useRef(true);
  useEffect(() => {
    if (!engine) {
      return;
    }

    if (first.current) {
      first.current = false;
      return;
    }

    const { b, id } = locate(pathname);
    engine.showPage(b, id);
  }, [engine, pathname]);

  useEffect(() => {
    engine?.refresh();
  }, [engine, text]);

  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  // Without the engine files the pages still have to work.
  if (failed) {
    return (
      <div className={styles.fallback}>
        <div className={styles.page}>{children}</div>
      </div>
    );
  }

  return (
    <>
      {engine
        ? createPortal(
            <>
              <div className={styles.bar}>
                <div className={styles.search}>
                  <IndexerSearchInputConnector />
                </div>

                <div className={styles.messages} />

                <div className={styles.actions}>
                  <PageHeaderActionsMenu
                    onKeyboardShortcutsPress={openShortcuts}
                  />
                </div>
              </div>

              <div className={styles.page}>{children}</div>
            </>,
            engine.host
          )
        : null}

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onModalClose={closeShortcuts}
      />
    </>
  );
}

export default Mc360Layout;
