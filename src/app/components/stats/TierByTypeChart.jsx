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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  const tierOrder = ['S', 'A', 'B', 'C', 'D', 'F'];
  const standardTypes = ['anime', 'tv', 'movies', 'games'];

  // Prepare data for sorting
  let typesToShow = Object.keys(data);
  
  // Sort types based on the selected criteria
  if (sortBy === 'type') {
    // Show standard types first, then custom types
    const standardInData = standardTypes.filter(type => typesToShow.includes(type));
    const customInData = customTypes.filter(type => typesToShow.includes(type));
    typesToShow = [...standardInData, ...customInData];
  } else if (sortBy === 'sTier') {
    // Sort by S tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aSPercent = aTotal > 0 ? (data[a]['S'] || 0) / aTotal : 0;
      const bSPercent = bTotal > 0 ? (data[b]['S'] || 0) / bTotal : 0;
      return bSPercent - aSPercent;
    });
  } else if (sortBy === 'aTier') {
    // Sort by A tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aAPercent = aTotal > 0 ? (data[a]['A'] || 0) / aTotal : 0;
      const bAPercent = bTotal > 0 ? (data[b]['A'] || 0) / bTotal : 0;
      return bAPercent - aAPercent;
    });
  } else if (sortBy === 'bTier') {
    // Sort by B tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aBPercent = aTotal > 0 ? (data[a]['B'] || 0) / aTotal : 0;
      const bBPercent = bTotal > 0 ? (data[b]['B'] || 0) / bTotal : 0;
      return bBPercent - aBPercent;
    });
  } else if (sortBy === 'cTier') {
    // Sort by C tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aCPercent = aTotal > 0 ? (data[a]['C'] || 0) / aTotal : 0;
      const bCPercent = bTotal > 0 ? (data[b]['C'] || 0) / bTotal : 0;
      return bCPercent - aCPercent;
    });
  } else if (sortBy === 'dTier') {
    // Sort by D tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aDPercent = aTotal > 0 ? (data[a]['D'] || 0) / aTotal : 0;
      const bDPercent = bTotal > 0 ? (data[b]['D'] || 0) / bTotal : 0;
      return bDPercent - aDPercent;
    });
  } else if (sortBy === 'fTier') {
    // Sort by F tier percentage descending
    typesToShow.sort((a, b) => {
      const aTotal = Object.values(data[a]).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(data[b]).reduce((sum, count) => sum + count, 0);
      const aFPercent = aTotal > 0 ? (data[a]['F'] || 0) / aTotal : 0;
      const bFPercent = bTotal > 0 ? (data[b]['F'] || 0) / bTotal : 0;
      return bFPercent - aFPercent;
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e5e7eb', // Light gray for legend text
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
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
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#e5e7eb', // Light gray for y-axis ticks
          callback: function(value) {
            return value + '%';
          },
        },
        title: {
          display: true,
          text: 'Percentage (%)',
          color: '#e5e7eb', // Light gray for y-axis title
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.2)', // Light gray grid lines
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TierByTypeChart; 