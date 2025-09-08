import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
const constants = require('../../constants');

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TierDistributionChart = ({ data, selectedTier, group, customTypes }) => {
  // If no data, show message
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No tier data available</p>
      </div>
    );
  }

  const standardTypes = ['anime', 'tv', 'movies', 'games'];
  const allTypes = [...standardTypes, ...customTypes];
  
  // Filter data to only include types that have the selected tier
  const filteredData = {};
  allTypes.forEach(type => {
    if (data[type] && data[type][selectedTier]) {
      filteredData[type] = data[type][selectedTier];
    }
  });

  // If no data for the selected tier, show message
  if (Object.keys(filteredData).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No {selectedTier} tier records found</p>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(filteredData),
    datasets: [
      {
        label: `Tier ${selectedTier} Records`,
        data: Object.values(filteredData),
        backgroundColor: Object.keys(filteredData).map((type, index) => {
          // Use predefined color for standard types, cycle through custom colors for custom types
          if (constants.typeColors[type]) {
            return constants.typeColors[type];
          } else {
            // Cycle through custom type colors
            return constants.customTypeColors[index % constants.customTypeColors.length];
          }
        }),
        borderColor: Object.keys(filteredData).map((type, index) => {
          // Use predefined color for standard types, cycle through custom colors for custom types
          if (constants.typeColors[type]) {
            return constants.typeColors[type];
          } else {
            // Cycle through custom type colors
            return constants.customTypeColors[index % constants.customTypeColors.length];
          }
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#e5e7eb', // Light gray for y-axis ticks
        },
        title: {
          display: true,
          text: 'Number of Records',
          color: '#e5e7eb', // Light gray for y-axis title
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.2)', // Light gray grid lines
        },
      },
      x: {
        ticks: {
          color: '#e5e7eb', // Light gray for x-axis ticks
        },
        title: {
          display: true,
          text: 'Type',
          color: '#e5e7eb', // Light gray for x-axis title
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.2)', // Light gray grid lines
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TierDistributionChart; 