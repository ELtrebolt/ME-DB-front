import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartConfig'; // Import to register Chart.js
import { getTypeColor, createBarChartOptions } from './chartConfig';
const constants = require('../../constants');

const TierDistributionChart = ({ data, selectedTier, group, customTypes }) => {
  // If no data, show message
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No tier data available</p>
      </div>
    );
  }

  const standardTypes = constants.STANDARD_MEDIA_TYPES;
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
        backgroundColor: Object.keys(filteredData).map((type, index) => getTypeColor(type, index)),
        borderColor: Object.keys(filteredData).map((type, index) => getTypeColor(type, index)),
        borderWidth: 1,
      },
    ],
  };

  const options = createBarChartOptions({ xTitle: 'Type' });

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TierDistributionChart; 