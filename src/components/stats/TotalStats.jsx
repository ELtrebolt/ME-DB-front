import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
const constants = require('../../constants');

const TotalStats = ({ totalRecords, totalCollection, totalToDo }) => {
  return (
    <Row>
      <Col md={4} className="mb-3">
        <Card className="text-center h-100">
          <Card.Body>
            <h3 className="text-primary">{totalToDo}</h3>
            <p className="mb-0">{constants.statsPage.totalToDo}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card className="text-center h-100">
          <Card.Body>
            <h3 className="text-success">{totalRecords}</h3>
            <p className="mb-0">{constants.statsPage.totalRecords}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card className="text-center h-100">
          <Card.Body>
            <h3 className="text-info">{totalCollection}</h3>
            <p className="mb-0">{constants.statsPage.totalCollection}</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TotalStats; 