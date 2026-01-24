import React from 'react';

const ExtraFilters = ({ 
  sortOrder, setSortOrder, 
  searchScope, setSearchScope, 
  onClearFilters, 
  setSearchChanged,
  timePeriod, setTimePeriod,
  startDate, setStartDate,
  endDate, setEndDate,
  tagLogic, setTagLogic,
  onLogicToggle
}) => {
  const toggleScope = (scope) => {
    let newScope;
    if (searchScope.includes(scope)) {
      newScope = searchScope.filter(s => s !== scope);
    } else {
      newScope = [...searchScope, scope];
    }
    setSearchScope(newScope);
    setSearchChanged(true);
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    if (timePeriod !== 'custom') {
      setTimePeriod('custom');
    }
    setSearchChanged(true);
  };

  return (
    <div className="extra-filters p-3 rounded mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="row g-2 align-items-end">
        {/* Custom Range Dates */}
        <div className="col-md-4">
          <label className="form-label text-white fw-semibold mb-2" style={{ fontSize: '0.875rem' }}>
            Custom Range {timePeriod !== 'custom' && <span className="text-warning" style={{ fontSize: '0.65rem' }}>(Select "Custom Range" to apply)</span>}
          </label>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              placeholder="Start"
            />
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              placeholder="End"
            />
          </div>
        </div>

        {/* Search Scope */}
        <div className="col-md-3">
          <label className="form-label text-white fw-semibold mb-2" style={{ fontSize: '0.875rem' }}>Search In</label>
          <div className="d-flex gap-2 py-1">
            {['title', 'tags', 'description'].map(scope => (
              <div key={scope} className="form-check form-check-inline m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`scope-${scope}`}
                  checked={searchScope.includes(scope)}
                  onChange={() => toggleScope(scope)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label text-white" htmlFor={`scope-${scope}`} style={{ fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                  {scope}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div className="col-md-2">
          <label className="form-label text-white fw-semibold mb-2" style={{ fontSize: '0.875rem' }}>Sort By</label>
          <select 
            className="form-select form-select-sm" 
            value={sortOrder} 
            onChange={(e) => { setSortOrder(e.target.value); setSearchChanged(true); }}
          >
            <option value="default">Default</option>
            <option value="dateNewest">Newest</option>
            <option value="dateOldest">Oldest</option>
            <option value="titleAZ">Title A-Z</option>
          </select>
        </div>

        {/* Tag Logic */}
        <div className="col-md-2">
          <label className="form-label text-white fw-semibold mb-2" style={{ fontSize: '0.875rem' }}>Tag Logic</label>
          <div className="btn-group btn-group-sm w-100" role="group">
            <button 
              type="button" 
              className={`btn btn-sm ${tagLogic === 'AND' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => tagLogic !== 'AND' && onLogicToggle()}
              style={{ fontSize: '0.7rem' }}
            >
              AND
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${tagLogic === 'OR' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => tagLogic !== 'OR' && onLogicToggle()}
              style={{ fontSize: '0.7rem' }}
            >
              OR
            </button>
          </div>
        </div>

        {/* Clear Actions */}
        <div className="col-md-1 d-flex">
          <button 
            className="btn btn-outline-danger btn-sm w-100" 
            onClick={onClearFilters}
            style={{ fontSize: '0.75rem', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraFilters;
