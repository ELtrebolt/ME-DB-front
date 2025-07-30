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
        backgroundColor: Object.keys(filteredData).map(type => 
          constants.typeColors[type] || constants.typeColors.other
        ),
        borderColor: Object.keys(filteredData).map(type => 
          constants.typeColors[type] || constants.typeColors.other
        ),
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
        },
        title: {
          display: true,
          text: 'Number of Records',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Type',
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