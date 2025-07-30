import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import TypeDistributionChart from '../components/stats/TypeDistributionChart';
import YearDistributionChart from '../components/stats/YearDistributionChart';
import TierDistributionChart from '../components/stats/TierDistributionChart';
import TierByTypeChart from '../components/stats/TierByTypeChart';
import TotalStats from '../components/stats/TotalStats';
const constants = require('../constants');

const Stats = ({ user }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedTier, setSelectedTier] = useState('S');
  const [tierSort, setTierSort] = useState('type');

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
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading statistics...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={fetchStats}
          >
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  if (!statsData) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          No statistics data available.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <h1 className="text-center mb-4">{constants.statsPage.title}</h1>
      
      {/* Top Row - Total Records */}
      <Row className="mb-4">
        <Col>
          <TotalStats 
            totalRecords={statsData.totals.totalRecords}
            totalCollection={statsData.totals.totalCollection}
            totalToDo={statsData.totals.totalToDo}
          />
        </Col>
      </Row>

      {/* 2nd Row - Distribution by Type */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5>Distribution by Standard Types</h5>
            </Card.Header>
            <Card.Body>
              <TypeDistributionChart 
                data={statsData.typeDistribution}
                customTypes={statsData.customTypes}
                showStandard={true}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5>Distribution by Custom Types</h5>
            </Card.Header>
            <Card.Body>
              <TypeDistributionChart 
                data={statsData.typeDistribution}
                customTypes={statsData.customTypes}
                showStandard={false}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3rd Row - Distribution by Year */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Distribution by Year</h5>
                <select 
                  className="form-select w-auto"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="all">{constants.statsPage.yearFilter.all}</option>
                  <option value="toDo">{constants.statsPage.yearFilter.toDo}</option>
                  <option value="collection">{constants.statsPage.yearFilter.collection}</option>
                </select>
              </div>
            </Card.Header>
            <Card.Body>
              <YearDistributionChart 
                data={statsData.yearDistributionByFilter[yearFilter]}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 4th Row - Distribution by Tier */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>To-Do Records by Tier</h5>
                <select 
                  className="form-select w-auto"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            </Card.Header>
            <Card.Body>
              <TierDistributionChart 
                data={statsData.tierByTypeToDo}
                selectedTier={selectedTier}
                group="toDo"
                customTypes={statsData.customTypes}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Collection Records by Tier</h5>
                <select 
                  className="form-select w-auto"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            </Card.Header>
            <Card.Body>
              <TierDistributionChart 
                data={statsData.tierByTypeCollection}
                selectedTier={selectedTier}
                group="collection"
                customTypes={statsData.customTypes}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 5th Row - Distribution of Tier by Type */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Distribution of Tier by Type</h5>
                <select 
                  className="form-select w-auto"
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
            </Card.Header>
            <Card.Body>
              <TierByTypeChart 
                data={statsData.tierByTypeDistribution}
                customTypes={statsData.customTypes}
                sortBy={tierSort}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Stats; 