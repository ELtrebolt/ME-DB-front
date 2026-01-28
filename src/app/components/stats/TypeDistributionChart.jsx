import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartConfig'; // Import to register Chart.js
import { getTypeColor, createBarChartOptions } from './chartConfig';
const constants = require('../../constants');

const TypeDistributionChart = ({ data, toDoData, collectionData, customTypes, showStandard, filter }) => {
  const standardTypes = constants.STANDARD_MEDIA_TYPES;
  
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
          backgroundColor: Object.keys(totalData).map((type, index) => getTypeColor(type, index)),
          borderColor: Object.keys(totalData).map((type, index) => getTypeColor(type, index)),
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

  const options = createBarChartOptions({ 
    xTitle: 'Type',
    showLegend: filter === 'split' // Show legend only for split view
  });

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TypeDistributionChart; 