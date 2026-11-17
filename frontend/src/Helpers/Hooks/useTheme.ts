import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import themes from 'Styles/Themes';

export type MateriaLook = 'materia' | 'green' | 'blades' | 'glass';

// "green" is Box of X, "blades" is Blades, "glass" is Liquid Glass; anything
// else (materia, auto, dark, light) is the FFVII menu.
export function resolveTheme(theme: string | undefined): MateriaLook {
  return theme === 'green' || theme === 'blades' || theme === 'glass'
    ? theme
    : 'materia';
}

export function createThemeSelector() {
  return createSelector(
    (state: AppState) => state.settings.ui.item.theme || window.Prowlarr.theme,
    (theme) => resolveTheme(theme)
  );
}

const useTheme = (): MateriaLook => {
  return useSelector(createThemeSelector());
};

export default useTheme;

export const useThemeColor = (color: string) => {
  const theme = useTheme();
  const themeVariables = themes[theme];

  // @ts-expect-error - themeVariables is a string indexable type
  return themeVariables[color];
};
