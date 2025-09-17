import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TypeDistributionChart from '../components/stats/TypeDistributionChart';
import YearDistributionChart from '../components/stats/YearDistributionChart';
import TierDistributionChart from '../components/stats/TierDistributionChart';
import TierByTypeChart from '../components/stats/TierByTypeChart';
const constants = require('../constants');

const Stats = ({ user }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTier, setSelectedTier] = useState('S');
  const [tierSort, setTierSort] = useState('type');
  const [typeFilter, setTypeFilter] = useState('total');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${constants.SERVER_URL}/api/stats`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log('Stats data received:', response.data.data);
        console.log('Custom types:', response.data.data.customTypes);
        console.log('Type distribution:', response.data.data.typeDistribution);
        setStatsData(response.data.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error loading statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'}}>
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-white">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                <div>
                  <strong>Error!</strong>
                  <span className="ms-2">{error}</span>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={fetchStats}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'}}>
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
    <div className="container-fluid min-vh-100" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'}}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3 text-white">{constants.statsPage.title}</h1>
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

        {/* 2nd Row - Distribution by Type (both charts on same row) */}
        <div className="mb-5">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card shadow-soft border-0 h-100" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="h5 fw-semibold text-white mb-0">Distribution by Standard Types</h5>
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
            <div className="col-lg-6">
              <div className="card shadow-soft border-0 h-100" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="h5 fw-semibold text-white mb-0">Distribution by Custom Types</h5>
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
                    showStandard={false}
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

        {/* 4th Row - Distribution by Tier (both charts on same row) */}
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

export default Stats; 