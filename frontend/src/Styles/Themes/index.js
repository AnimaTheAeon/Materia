import * as green from './green';
import * as materia from './materia';

// "materia" is the FFVII menu look, "green" is Box of X.
// Older saved values (auto, dark, light) fall back to the FFVII menu.
export const themeOptions = [
  { key: 'materia', value: 'FFVII menu' },
  { key: 'green', value: 'Box of X' }
];

export default {
  auto: materia,
  materia,
  green,
  dark: materia,
  light: materia
};
