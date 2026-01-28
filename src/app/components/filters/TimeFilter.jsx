import React from 'react';

const TimeFilter = ({ timePeriod, setTimePeriod, setSearchChanged }) => {
  const onPeriodChange = (e) => {
    setTimePeriod(e.target.value);
    setSearchChanged(true);
  };

  return (
    <div className="time-filter-container" style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor='timePeriod' className='form-label fw-semibold text-white mb-1' style={{ fontSize: '0.875rem' }}>
          Filter by Time Period
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            id='timePeriod'
            value={timePeriod}
            onChange={onPeriodChange}
            style={{
              backgroundColor: '#ffffff',
              color: '#212529',
              border: '2px solid #afb8c1',
              borderRadius: '6px',
              padding: '0.375rem 0.5rem',
              flex: '1',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Time</option>
            <option value="ytd">Year to Date (YTD)</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="last12Months">Last 12 Months</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimeFilter;
