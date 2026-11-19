import { useEffect } from 'react';
import useTheme from 'Helpers/Hooks/useTheme';
import themes from 'Styles/Themes';
import glassCss from 'Styles/Themes/glassCss';

function ApplyTheme() {
  const theme = useTheme();

  useEffect(() => {
    Object.entries(themes[theme]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value as string);
    });

    // Lets global styles (fonts, upper-case headings) follow the theme.
    // MC360 pages reuse the Blades page styling.
    document.documentElement.setAttribute(
      'data-theme',
      theme === 'mc360' ? 'blades' : theme
    );
    document.documentElement.classList.toggle('mc360', theme === 'mc360');

    // Dark Glass: shapes, blur and motion hang off html.glass.
    document.documentElement.classList.toggle('glass', theme === 'glass');
    if (theme === 'glass' && !document.getElementById('glass-css')) {
      const style = document.createElement('style');
      style.id = 'glass-css';
      style.textContent = glassCss;
      document.head.appendChild(style);
    }
  }, [theme]);

  // Dark Glass: the menu's selection pill glides to the open page. The
  // pill is the menu's ::before; this keeps its position in CSS variables.
  useEffect(() => {
    if (theme !== 'glass') {
      return undefined;
    }

    let frame = 0;
    const place = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bar = document.querySelector<HTMLElement>(
          '[class^="PageSidebar-sidebar-"], [class*=" PageSidebar-sidebar-"]'
        );
        if (!bar) {
          return;
        }
        const links = bar.querySelectorAll<HTMLElement>(
          '[class*="PageSidebarItem-isActiveLink-"]'
        );
        const cur = links[links.length - 1];
        if (!cur) {
          bar.style.setProperty('--sel-w', '0px');
          return;
        }
        const a = cur.getBoundingClientRect();
        const b = bar.getBoundingClientRect();
        bar.style.setProperty(
          '--sel-top',
          `${a.top - b.top + bar.scrollTop}px`
        );
        bar.style.setProperty('--sel-left', `${a.left - b.left}px`);
        bar.style.setProperty('--sel-w', `${a.width}px`);
        bar.style.setProperty('--sel-h', `${a.height}px`);
      });
    };
    const watch = new MutationObserver(place);
    watch.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('resize', place);
    place();

    return () => {
      watch.disconnect();
      window.removeEventListener('resize', place);
      cancelAnimationFrame(frame);
    };
  }, [theme]);

  return null;
}

export default ApplyTheme;
