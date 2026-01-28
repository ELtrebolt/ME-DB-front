import React from 'react';
const constants = require('../../constants');

const TotalStats = ({ totalRecords, totalCollection, totalToDo }) => {
  const statsConfig = [
    { key: 'totalToDo', value: totalToDo, labelKey: 'totalToDo', colorClass: 'text-primary' },
    { key: 'totalRecords', value: totalRecords, labelKey: 'totalRecords', colorClass: 'text-success' },
    { key: 'totalCollection', value: totalCollection, labelKey: 'totalCollection', colorClass: 'text-warning' },
  ];

  return (
    <div className="row g-4 mb-5">
      {statsConfig.map((stat) => (
        <div key={stat.key} className="col-md-4">
          <div className="card shadow-soft border-0 h-100">
            <div className="card-body text-center p-4">
              <h3 className={`${stat.colorClass} display-6 fw-bold mb-2`}>{stat.value}</h3>
              <p className="text-dark fw-medium mb-0">{constants.statsPage[stat.labelKey]}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TotalStats; 