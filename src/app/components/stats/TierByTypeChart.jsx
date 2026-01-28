import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartConfig'; // Import to register Chart.js
import { createBarChartOptions } from './chartConfig';
const constants = require('../../constants');

const TierByTypeChart = ({ data, customTypes, sortBy }) => {
  // If no data, show message
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No tier by type data available</p>
      </div>
    );
  }

  // Define tier colors
  const tierColors = {
    'S': '#FFD700', // Gold
    'A': '#FF6B6B', // Red
    'B': '#4ECDC4', // Teal
    'C': '#45B7D1', // Blue
    'D': '#96CEB4', // Green
    'F': '#95A5A6', // Gray
  };

  const tierOrder = constants.STANDARD_TIERS;
  const standardTypes = constants.STANDARD_MEDIA_TYPES;

  // Prepare data for sorting
  let typesToShow = Object.keys(data);
  
  // Sort types based on the selected criteria
  if (sortBy === 'type') {
    // Show standard types first, then custom types
    const standardInData = standardTypes.filter(type => typesToShow.includes(type));
    const customInData = customTypes.filter(type => typesToShow.includes(type));
    typesToShow = [...standardInData, ...customInData];
  } else if (sortBy && sortBy.endsWith('Tier')) {
    // Parameterized sort for all tier sorts (sTier, aTier, bTier, cTier, dTier, fTier)
    const tier = sortBy.charAt(0).toUpperCase(); // Extract tier letter (e.g., 'sTier' -> 'S')
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aTierPercent = aTotal > 0 ? (data[a][tier] || 0) / aTotal : 0;
      const bTierPercent = bTotal > 0 ? (data[b][tier] || 0) / bTotal : 0;
      return bTierPercent - aTierPercent; // Descending order
    });
  }

  // Convert data to percentages and create datasets for each tier
  const datasets = tierOrder.map(tier => ({
    label: `Tier ${tier}`,
    data: typesToShow.map(type => {
      const total = Object.values(data[type]).reduce((sum, count) => sum + count, 0);
      return total > 0 ? ((data[type][tier] || 0) / total * 100) : 0;
    }),
    backgroundColor: tierColors[tier],
    borderColor: tierColors[tier],
    borderWidth: 1,
  }));

  const chartData = {
    labels: typesToShow,
    datasets: datasets,
  };

  const options = createBarChartOptions({ 
    xTitle: 'Type',
    yTitle: 'Percentage (%)',
    showLegend: true,
    stacked: true,
    yMax: 100,
    yTicksCallback: function(value) {
      return value + '%';
    }
  });

  return (
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TierByTypeChart; 