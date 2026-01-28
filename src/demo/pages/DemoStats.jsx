import React, { useMemo } from 'react';
import { useAllDemoData } from "../hooks/useDemoData";
import Stats from '../../app/pages/Stats';
const constants = require('../../app/constants');

const DemoStats = () => {
  const { allData, loading } = useAllDemoData();

  // Calculate stats function
  const calculateStats = useMemo(() => {
    if (!allData || loading) return null;

    const totals = {
      totalToDo: 0,
      totalCollection: 0,
      totalRecords: 0
    };

    // Type distribution (total count per type)
    const typeDistribution = {};
    constants.STANDARD_MEDIA_TYPES.forEach(type => {
      typeDistribution[type] = 0;
    });

    // Tier by type for To-Do and Collection separately
    const tierByTypeToDo = {};
    const tierByTypeCollection = {};
    const tierByTypeDistribution = {};
    constants.STANDARD_MEDIA_TYPES.forEach(type => {
      tierByTypeToDo[type] = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
      tierByTypeCollection[type] = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
      tierByTypeDistribution[type] = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    });

    // Year distribution
    const yearDistributionAll = {};
    const yearDistributionToDo = {};
    const yearDistributionCollection = {};

    // Process each media type
    Object.keys(allData).forEach(type => {
      const items = allData[type] || [];
      typeDistribution[type] = items.length;

      items.forEach(item => {
        totals.totalRecords++;
        
        if (item.toDo) {
          totals.totalToDo++;
          if (item.tier && tierByTypeToDo[type]) {
            tierByTypeToDo[type][item.tier]++;
          }
        } else {
          totals.totalCollection++;
          if (item.tier && tierByTypeCollection[type]) {
            tierByTypeCollection[type][item.tier]++;
          }
        }

        // Combined tier by type
        if (item.tier && tierByTypeDistribution[type]) {
          tierByTypeDistribution[type][item.tier]++;
        }

        // Year distribution
        if (item.year) {
          const year = new Date(item.year).getFullYear();
          yearDistributionAll[year] = (yearDistributionAll[year] || 0) + 1;
          if (item.toDo) {
            yearDistributionToDo[year] = (yearDistributionToDo[year] || 0) + 1;
          } else {
            yearDistributionCollection[year] = (yearDistributionCollection[year] || 0) + 1;
          }
        }
      });
    });

    return {
      totals,
      typeDistribution,
      tierByTypeToDo,
      tierByTypeCollection,
      tierByTypeDistribution,
      yearDistributionByFilter: {
        all: yearDistributionAll,
        toDo: yearDistributionToDo,
        collection: yearDistributionCollection
      },
      customTypes: [] // Demo doesn't have custom types
    };
  }, [allData, loading]);

  // Callback function that returns stats
  const handleCalculateStats = () => {
    return calculateStats;
  };

  return (
    <Stats
      dataSource="demo"
      onCalculateStats={handleCalculateStats}
    />
  );
};

export default DemoStats;
