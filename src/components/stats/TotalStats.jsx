import React from 'react';
const constants = require('../../constants');

const TotalStats = ({ totalRecords, totalCollection, totalToDo }) => {
  return (
    <div className="row g-4 mb-5">
      <div className="col-md-4">
        <div className="card shadow-soft border-0 h-100">
          <div className="card-body text-center p-4">
            <h3 className="text-primary display-6 fw-bold mb-2">{totalToDo}</h3>
            <p className="text-dark fw-medium mb-0">{constants.statsPage.totalToDo}</p>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-soft border-0 h-100">
          <div className="card-body text-center p-4">
            <h3 className="text-success display-6 fw-bold mb-2">{totalRecords}</h3>
            <p className="text-dark fw-medium mb-0">{constants.statsPage.totalRecords}</p>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-soft border-0 h-100">
          <div className="card-body text-center p-4">
            <h3 className="text-warning display-6 fw-bold mb-2">{totalCollection}</h3>
            <p className="text-dark fw-medium mb-0">{constants.statsPage.totalCollection}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalStats; 