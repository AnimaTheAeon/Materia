import { useEffect } from 'react';
import useTheme from 'Helpers/Hooks/useTheme';
import themes from 'Styles/Themes';

function ApplyTheme() {
  const theme = useTheme();

  useEffect(() => {
    Object.entries(themes[theme]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value as string);
    });

    // Lets global styles (fonts, upper-case headings) follow the theme.
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}

export default ApplyTheme;
