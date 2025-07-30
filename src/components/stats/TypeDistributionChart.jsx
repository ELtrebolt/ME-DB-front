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

const TypeDistributionChart = ({ data, customTypes, showStandard }) => {
  const standardTypes = ['anime', 'tv', 'movies', 'games'];
  
  console.log('TypeDistributionChart props:', { data, customTypes, showStandard });
  
  // Filter data based on whether to show standard or custom types
  let filteredData = {};
  if (showStandard) {
    standardTypes.forEach(type => {
      if (data[type]) {
        filteredData[type] = data[type];
      }
    });
  } else {
    customTypes.forEach(type => {
      // Show custom types even if they have 0 records
      filteredData[type] = data[type] || 0;
    });
  }

  // If no custom types and we're showing custom types, show message
  if (!showStandard && customTypes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">{constants.statsPage.noCustomTypes}</p>
      </div>
    );
  }

  // If no data for the selected type, show message
  if (Object.keys(filteredData).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">
          {!showStandard && customTypes.length > 0 
            ? "No records found for custom types" 
            : "No data available"}
        </p>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(filteredData),
    datasets: [
      {
        label: 'Number of Records',
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
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TypeDistributionChart; 