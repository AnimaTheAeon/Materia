import Chart from 'chart.js/auto';

// Chart text and grid lines follow the current theme (FFVII menu or Box of X).
export default function applyChartTheme() {
  const style = getComputedStyle(document.documentElement);
  const text = style.getPropertyValue('--textColor').trim();
  const grid = style.getPropertyValue('--windowBorderMid').trim();

  if (text) {
    Chart.defaults.color = text;
  }

  if (grid) {
    Chart.defaults.borderColor = grid;
  }
}
