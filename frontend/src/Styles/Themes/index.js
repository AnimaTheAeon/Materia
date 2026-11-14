import * as blades from './blades';
import * as green from './green';
import * as materia from './materia';

// "materia" is the FFVII menu look, "green" is Box of X, "blades" is Blades.
// Older saved values (auto, dark, light) fall back to the FFVII menu.
export const themeOptions = [
  { key: 'materia', value: 'FFVII menu' },
  { key: 'green', value: 'Box of X' },
  { key: 'blades', value: 'Blades' }
];

export default {
  auto: materia,
  materia,
  green,
  blades,
  dark: materia,
  light: materia
};
