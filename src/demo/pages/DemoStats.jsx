import React, { useState, useEffect } from 'react';
import { useAllDemoData } from "../hooks/useDemoData";
import TypeDistributionChart from '../../app/components/stats/TypeDistributionChart';
import YearDistributionChart from '../../app/components/stats/YearDistributionChart';
import TierDistributionChart from '../../app/components/stats/TierDistributionChart';
import TierByTypeChart from '../../app/components/stats/TierByTypeChart';

const constants = require('../../app/constants');
const theme = require('../../styling/theme');

const DemoStats = () => {
  const { allData, loading } = useAllDemoData();
  const [statsData, setStatsData] = useState(null);
  const [selectedTier, setSelectedTier] = useState('S');
  const [tierSort, setTierSort] = useState('type');
  const [typeFilter, setTypeFilter] = useState('total');

  useEffect(() => {
    if (allData && !loading) {
      // Calculate stats from demo data in the same format as the backend API
      const stats = calculateStats(allData);
      setStatsData(stats);
    }
  }, [allData, loading]);

  const calculateStats = (data) => {
    const totals = {
      totalToDo: 0,
      totalCollection: 0,
      totalRecords: 0
    };

    // Type distribution (total count per type)
    const typeDistribution = {
      anime: 0,
      tv: 0,
      movies: 0,
      games: 0
    };

    // Tier by type for To-Do and Collection separately
    const tierByTypeToDo = {
      anime: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      tv: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      movies: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      games: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
    };

    const tierByTypeCollection = {
      anime: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      tv: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      movies: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      games: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
    };

    // Tier by type distribution (combined for the table chart)
    const tierByTypeDistribution = {
      anime: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      tv: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      movies: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
      games: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
    };

    // Year distribution
    const yearDistributionAll = {};
    const yearDistributionToDo = {};
    const yearDistributionCollection = {};

    // Process each media type
    Object.keys(data).forEach(type => {
      const items = data[type] || [];
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
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center" style={{backgroundColor: theme.colors.background.primary}}>
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-white">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center" style={{backgroundColor: theme.colors.background.primary}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="alert alert-warning" role="alert">
                <strong>Warning!</strong>
                <span className="ms-2">No statistics data available.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100" style={{backgroundColor: theme.colors.background.primary}}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3 text-white">Demo Statistics</h1>
          <div className="border-bottom border-3 border-white w-25 mx-auto"></div>
        </div>
        
        {/* Top Row - Total Records in styled boxes */}
        <div className="mb-5">
          <div className="row g-2 g-md-4">
            <div className="col-4 col-lg-4 col-md-6">
              <div className="card border-primary border-2 h-100 shadow-soft" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body text-center p-2 p-md-4">
                  <h3 className="text-primary display-6 fw-bold mb-2 stats-number-mobile">{statsData.totals.totalToDo}</h3>
                  <p className="text-white fw-medium mb-0 stats-label-mobile">{constants.statsPage.totalToDo}</p>
                </div>
              </div>
            </div>
            <div className="col-4 col-lg-4 col-md-6">
              <div className="card border-success border-2 h-100 shadow-soft" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body text-center p-2 p-md-4">
                  <h3 className="text-success display-6 fw-bold mb-2 stats-number-mobile">{statsData.totals.totalRecords}</h3>
                  <p className="text-white fw-medium mb-0 stats-label-mobile">{constants.statsPage.totalRecords}</p>
                </div>
              </div>
            </div>
            <div className="col-4 col-lg-4 col-md-6">
              <div className="card border-warning border-2 h-100 shadow-soft" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body text-center p-2 p-md-4">
                  <h3 className="text-warning display-6 fw-bold mb-2 stats-number-mobile">{statsData.totals.totalCollection}</h3>
                  <p className="text-white fw-medium mb-0 stats-label-mobile">{constants.statsPage.totalCollection}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2nd Row - Distribution by Type */}
        <div className="mb-5">
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="card shadow-soft border-0 h-100" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="h5 fw-semibold text-white mb-0">Distribution by Type</h5>
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="total">Total</option>
                      <option value="split">To-Do vs Collection</option>
                    </select>
                  </div>
                  <TypeDistributionChart 
                    data={statsData.typeDistribution}
                    toDoData={statsData.tierByTypeToDo}
                    collectionData={statsData.tierByTypeCollection}
                    customTypes={statsData.customTypes}
                    showStandard={true}
                    filter={typeFilter}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Row - Distribution by Year */}
        <div className="mb-5">
          <div className="card shadow-soft border-0" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="h5 fw-semibold text-white mb-0">Distribution by Year</h5>
                <select 
                  className="form-select form-select-sm w-auto"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="total">Total</option>
                  <option value="split">To-Do vs Collection</option>
                </select>
              </div>
              <YearDistributionChart 
                data={statsData.yearDistributionByFilter.all}
                toDoData={statsData.yearDistributionByFilter.toDo}
                collectionData={statsData.yearDistributionByFilter.collection}
                filter={typeFilter}
              />
            </div>
          </div>
        </div>

        {/* 4th Row - Distribution by Tier */}
        <div className="mb-5">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card shadow-soft border-0 h-100" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="h5 fw-semibold text-white mb-0">To-Do Records by Tier</h5>
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                    >
                      {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                  <TierDistributionChart 
                    data={statsData.tierByTypeToDo}
                    selectedTier={selectedTier}
                    group="toDo"
                    customTypes={statsData.customTypes}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-soft border-0 h-100" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="h5 fw-semibold text-white mb-0">Collection Records by Tier</h5>
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                    >
                      {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                  <TierDistributionChart 
                    data={statsData.tierByTypeCollection}
                    selectedTier={selectedTier}
                    group="collection"
                    customTypes={statsData.customTypes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5th Row - Distribution of Tier by Type */}
        <div className="mb-5">
          <div className="card shadow-soft border-0" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="h5 fw-semibold text-white mb-0">Distribution of Tier by Type</h5>
                <select 
                  className="form-select form-select-sm w-auto"
                  value={tierSort}
                  onChange={(e) => setTierSort(e.target.value)}
                >
                  <option value="sTier">{constants.statsPage.tierSort.sTier}</option>
                  <option value="aTier">{constants.statsPage.tierSort.aTier}</option>
                  <option value="bTier">{constants.statsPage.tierSort.bTier}</option>
                  <option value="cTier">{constants.statsPage.tierSort.cTier}</option>
                  <option value="dTier">{constants.statsPage.tierSort.dTier}</option>
                  <option value="fTier">{constants.statsPage.tierSort.fTier}</option>
                  <option value="type">{constants.statsPage.tierSort.type}</option>
                </select>
              </div>
              <TierByTypeChart 
                data={statsData.tierByTypeDistribution}
                customTypes={statsData.customTypes}
                sortBy={tierSort}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStats;
