import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const gridColor = 'rgba(148, 163, 184, 0.08)';
const tickColor = 'rgba(148, 163, 184, 0.7)';

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: tickColor, font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle' },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Inter', weight: 600 as const },
      bodyFont: { family: 'Inter' },
    },
  },
  scales: {
    x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'Inter', size: 11 } } },
  },
};

export { Line, Bar, Doughnut, Radar };
