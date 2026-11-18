import * as blades from './blades';
import * as glass from './glass';
import * as green from './green';
import * as materia from './materia';

// "materia" is the FFVII menu look, "green" is Xbox, "blades" is Blades,
// "glass" is Dark Glass.
// Older saved values (auto, dark, light) fall back to the FFVII menu.
export const themeOptions = [
  { key: 'materia', value: 'FFVII Menu' },
  { key: 'green', value: 'Xbox' },
  { key: 'blades', value: 'Blades' },
  { key: 'glass', value: 'Dark Glass' }
];

export default {
  auto: materia,
  materia,
  green,
  blades,
  glass,
  dark: materia,
  light: materia
};
