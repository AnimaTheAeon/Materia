import * as blades from './blades';
import * as glass from './glass';
import * as green from './green';
import * as materia from './materia';

// MC360 pages keep the Blades colors: white text on see-through panes.
const mc360 = blades;

// "materia" is the FFVII menu look, "green" is Xbox, "blades" is Blades,
// "glass" is Dark Glass, "mc360" is MC360.
// Older saved values (auto, dark, light) fall back to the FFVII menu.
export const themeOptions = [
  { key: 'materia', value: 'FFVII Menu' },
  { key: 'green', value: 'Xbox' },
  { key: 'blades', value: 'Blades' },
  { key: 'glass', value: 'Dark Glass' },
  { key: 'mc360', value: 'MC360' }
];

export default {
  auto: materia,
  materia,
  green,
  blades,
  glass,
  mc360,
  dark: materia,
  light: materia
};
