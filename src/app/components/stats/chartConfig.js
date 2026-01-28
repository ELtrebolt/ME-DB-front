import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const constants = require('../../constants');

/**
 * Get color for a media type
 * @param {string} type - The media type
 * @param {number} index - Index for custom types (used for cycling through customTypeColors)
 * @returns {string} - Color hex code
 */
export function getTypeColor(type, index) {
  if (constants.typeColors[type]) {
    return constants.typeColors[type];
  } else {
    return constants.customTypeColors[index % constants.customTypeColors.length];
  }
}

/**
 * Create bar chart options with shared configuration
 * @param {object} options - Options object
 * @param {string} options.xTitle - X-axis title
 * @param {string} options.yTitle - Y-axis title (default: 'Number of Records')
 * @param {boolean} options.showLegend - Whether to show legend (default: false)
 * @param {boolean} options.stacked - Whether bars are stacked (default: false)
 * @param {number} options.yMax - Maximum value for y-axis
 * @param {function} options.yTicksCallback - Callback for y-axis tick formatting
 * @returns {object} - Chart.js options object
 */
export function createBarChartOptions({ 
  xTitle, 
  yTitle = 'Number of Records', 
  showLegend = false, 
  stacked = false,
  yMax,
  yTicksCallback
} = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: showLegend ? 'top' : undefined,
        labels: {
          color: '#e5e7eb', // Light gray for legend text
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        stacked: stacked,
        beginAtZero: true,
        ...(yMax !== undefined && { max: yMax }),
        ticks: {
          stepSize: 1,
          color: '#e5e7eb', // Light gray for y-axis ticks
          ...(yTicksCallback && { callback: yTicksCallback }),
        },
        title: {
          display: true,
          text: yTitle,
          color: '#e5e7eb', // Light gray for y-axis title
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.2)', // Light gray grid lines
        },
      },
      x: {
        stacked: stacked,
        ticks: {
          color: '#e5e7eb', // Light gray for x-axis ticks
        },
        title: {
          display: true,
          text: xTitle || 'Type',
          color: '#e5e7eb', // Light gray for x-axis title
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.2)', // Light gray grid lines
        },
      },
    },
  };
}
