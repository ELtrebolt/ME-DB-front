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

const TypeDistributionChart = ({ data, toDoData, collectionData, customTypes, showStandard, filter }) => {
  const standardTypes = ['anime', 'tv', 'movies', 'games'];
  
  console.log('TypeDistributionChart props:', { data, toDoData, collectionData, customTypes, showStandard, filter });
  
  // Filter data based on whether to show standard or custom types
  let typesToShow = [];
  if (showStandard) {
    typesToShow = standardTypes.filter(type => data[type]);
  } else {
    typesToShow = customTypes;
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
  if (typesToShow.length === 0) {
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

  let chartData;
  
  if (filter === 'total') {
    // Show total counts
    const totalData = {};
    typesToShow.forEach(type => {
      totalData[type] = data[type] || 0;
    });

    chartData = {
      labels: Object.keys(totalData),
      datasets: [
        {
          label: 'Number of Records',
          data: Object.values(totalData),
          backgroundColor: Object.keys(totalData).map((type, index) => {
            // Use predefined color for standard types, cycle through custom colors for custom types
            if (constants.typeColors[type]) {
              return constants.typeColors[type];
            } else {
              // Cycle through custom type colors
              return constants.customTypeColors[index % constants.customTypeColors.length];
            }
          }),
          borderColor: Object.keys(totalData).map((type, index) => {
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
  } else {
    // Show to-do vs collection side by side
    const toDoCounts = [];
    const collectionCounts = [];
    
    typesToShow.forEach(type => {
      // Calculate to-do count
      const toDoCount = toDoData[type] ? Object.values(toDoData[type]).reduce((sum, count) => sum + count, 0) : 0;
      toDoCounts.push(toDoCount);
      
      // Calculate collection count
      const collectionCount = collectionData[type] ? Object.values(collectionData[type]).reduce((sum, count) => sum + count, 0) : 0;
      collectionCounts.push(collectionCount);
    });

    chartData = {
      labels: typesToShow,
      datasets: [
        {
          label: 'To-Do',
          data: toDoCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Collection',
          data: collectionCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: filter === 'split', // Show legend only for split view
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

export default TypeDistributionChart; 