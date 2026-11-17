// Liquid Glass (dark): frosted glass panes over a dark, softly lit backdrop,
// iOS system colors. Shapes, blur and motion are in glassCss.js.
const materia = require('./materia');

const accent = '#0a84ff';
const good = '#30d158';
const warn = '#ff9f0a';
const bad = '#ff453a';
const well = 'rgba(118, 118, 128, 0.24)';
const ink = '#ffffff';
const inkSoft = 'rgba(235, 235, 245, 0.86)';
const inkMuted = 'rgba(235, 235, 245, 0.62)';
const pane = 'rgba(255, 255, 255, 0.06)';
const line = 'rgba(84, 84, 88, 0.5)';
const sheet = '#1e1e24';

module.exports = {
  ...materia,

  windowGradient: pane,
  windowBorderLight: 'transparent',
  windowBorderMid: line,
  windowBorderDark: 'rgba(0, 0, 0, 0.45)',
  statLabelColor: inkMuted,
  labelTextColor: ink,
  windowRadius: '26px',
  windowClip: 'none',
  windowShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.05), 0 18px 48px rgba(0, 0, 0, 0.45)',
  windowTextShadow: 'none',
  displayFont: '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'Segoe UI Variable Display\', \'Segoe UI\', Inter, system-ui, sans-serif',
  displayTransform: 'none',
  displayLetterSpacing: '-0.3px',
  displayScale: '1',
  squareRadius: '50%',
  squareBackground: 'rgba(118, 118, 128, 0.32)',
  squareTextColor: ink,
  barGradient: accent,

  textColor: ink,
  defaultColor: ink,
  disabledColor: 'rgba(235, 235, 245, 0.3)',
  dimColor: inkMuted,
  primaryColor: accent,
  selectedColor: accent,
  successColor: good,
  dangerColor: bad,
  warningColor: warn,
  infoColor: '#64b5ff',
  purple: '#bf5af2',
  helpTextColor: inkMuted,
  darkGray: inkMuted,
  gray: inkSoft,

  themeBlue: accent,
  themeRed: bad,
  themeDarkColor: sheet,
  themeLightColor: accent,
  pageBackground: 'transparent',

  torrentColor: good,
  usenetColor: warn,

  inverseLabelColor: 'rgba(118, 118, 128, 0.4)',
  inverseLabelTextColor: ink,

  defaultLinkHoverColor: ink,
  linkColor: '#64b5ff',
  linkHoverColor: '#99ccff',

  sidebarColor: inkSoft,
  sidebarActiveBackgroundColor: 'transparent',

  toolbarColor: ink,
  toolbarMenuItemBackgroundColor: sheet,
  toolbarMenuItemHoverBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  toolbarLabelColor: ink,

  borderColor: line,
  inputBorderColor: 'transparent',
  inputBoxShadowColor: 'transparent',
  inputFocusBorderColor: accent,
  inputFocusBoxShadowColor: 'rgba(10, 132, 255, 0.35)',

  defaultButtonTextColor: ink,
  defaultButtonBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  defaultBorderColor: 'transparent',
  defaultHoverBackgroundColor: 'rgba(255, 255, 255, 0.17)',
  defaultHoverBorderColor: 'transparent',
  primaryBackgroundColor: accent,
  primaryBorderColor: 'transparent',
  primaryHoverBackgroundColor: '#2a95ff',
  primaryHoverBorderColor: 'transparent',
  successBackgroundColor: '#28b44c',
  successBorderColor: 'transparent',
  successHoverBackgroundColor: good,
  successHoverBorderColor: 'transparent',
  warningBackgroundColor: '#e08a00',
  warningBorderColor: 'transparent',
  warningHoverBackgroundColor: warn,
  warningHoverBorderColor: 'transparent',
  dangerBackgroundColor: 'rgba(255, 69, 58, 0.85)',
  dangerBorderColor: 'transparent',
  dangerHoverBackgroundColor: bad,
  dangerHoverBorderColor: 'transparent',
  iconButtonDisabledColor: 'rgba(235, 235, 245, 0.3)',
  iconButtonHoverColor: ink,
  iconButtonHoverLightColor: ink,

  modalBackdropBackgroundColor: 'rgba(0, 0, 0, 0.45)',
  modalBackgroundColor: sheet,
  modalCloseButtonHoverColor: ink,

  menuItemColor: ink,
  menuItemHoverColor: ink,
  menuItemHoverBackgroundColor: 'rgba(255, 255, 255, 0.1)',

  toobarButtonHoverColor: ink,
  toobarButtonSelectedColor: accent,

  scrollbarBackgroundColor: 'rgba(255, 255, 255, 0.22)',
  scrollbarHoverBackgroundColor: 'rgba(255, 255, 255, 0.4)',

  cardBackgroundColor: pane,
  cardShadowColor: 'rgba(0, 0, 0, 0.35)',
  cardAlternateBackgroundColor: 'rgba(255, 255, 255, 0.04)',
  cardCenterBackgroundColor: pane,

  alertDangerBorderColor: 'transparent',
  alertDangerBackgroundColor: 'rgba(255, 69, 58, 0.16)',
  alertDangerColor: ink,
  alertInfoBorderColor: 'transparent',
  alertInfoBackgroundColor: 'rgba(10, 132, 255, 0.16)',
  alertInfoColor: ink,
  alertSuccessBorderColor: 'transparent',
  alertSuccessBackgroundColor: 'rgba(48, 209, 88, 0.14)',
  alertSuccessColor: ink,
  alertWarningBorderColor: 'transparent',
  alertWarningBackgroundColor: 'rgba(255, 159, 10, 0.14)',
  alertWarningColor: ink,

  inputBackgroundColor: well,
  inputReadOnlyBackgroundColor: 'rgba(118, 118, 128, 0.14)',
  inputHoverBackgroundColor: 'rgba(118, 118, 128, 0.32)',
  inputSelectedBackgroundColor: 'rgba(10, 132, 255, 0.3)',
  advancedFormLabelColor: warn,
  disabledCheckInputColor: 'rgba(120, 120, 128, 0.2)',
  checkInputBackgroundColor: 'rgba(120, 120, 128, 0.36)',
  checkInputBorderColor: 'transparent',
  checkInputTickColor: ink,
  disabledInputColor: 'rgba(235, 235, 245, 0.3)',

  popoverTitleBackgroundColor: '#2a2a32',
  popoverTitleBorderColor: line,
  popoverBodyBackgroundColor: sheet,
  popoverShadowColor: 'rgba(0, 0, 0, 0.45)',
  popoverArrowBorderColor: sheet,
  popoverTitleBackgroundInverseColor: '#2a2a32',
  popoverTitleBorderInverseColor: line,
  popoverShadowInverseColor: 'rgba(0, 0, 0, 0.45)',
  popoverArrowBorderInverseColor: sheet,

  tableRowHoverBackgroundColor: 'rgba(255, 255, 255, 0.05)',

  chartColorsDiversified: [accent, warn, good, '#bf5af2', '#ff6961', '#64d2ff', '#ffd60a', '#5e5ce6', '#66d4cf', '#ff9f0a'].join(','),
  chartColors: ['#64d2ff', '#409cff', accent, '#5e5ce6', good, warn, '#bf5af2', bad].join(',')
};
