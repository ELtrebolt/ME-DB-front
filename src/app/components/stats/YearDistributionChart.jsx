import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartConfig'; // Import to register Chart.js
import { createBarChartOptions } from './chartConfig';

const YearDistributionChart = ({ data, toDoData, collectionData, filter }) => {
  // If no data, show message
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No year data available</p>
      </div>
    );
  }

  // Sort years in ascending order
  const sortedYears = Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b));

  let chartData;
  
  if (filter === 'total') {
    // Show total counts
    const sortedData = sortedYears.map(year => data[year]);

    chartData = {
      labels: sortedYears,
      datasets: [
        {
          label: 'Number of Records',
          data: sortedData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  } else {
    // Show to-do vs collection side by side
    const toDoCounts = [];
    const collectionCounts = [];
    
    sortedYears.forEach(year => {
      // Get to-do count for this year
      const toDoCount = toDoData[year] || 0;
      toDoCounts.push(toDoCount);
      
      // Get collection count for this year
      const collectionCount = collectionData[year] || 0;
      collectionCounts.push(collectionCount);
    });

    chartData = {
      labels: sortedYears,
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
    xTitle: 'Year',
    showLegend: filter === 'split' // Show legend only for split view
  });

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default YearDistributionChart; 