import React, { useState } from 'react';

const Function = ({possible_years, setFirstYear, setLastYear}) => {
  const [firstYearValue, setFirstYearValue] = useState();
  const [lastYearValue, setLastYearValue] = useState();

  const onChangeFirstYear = (e) => {
    setFirstYear(e.target.value );
    setFirstYearValue(e.target.value);
  };
  
  const onChangeLastYear = (e) => {
    setLastYear(e.target.value );
    setLastYearValue(e.target.value);
  };

  return (
    <><div className='col-md-2 mt-auto'>
      <div className='form-group'>
        <label htmlFor='firstYear'>First Year</label>
        <select className='form-control' name='firstYear' value={firstYearValue} onChange={onChangeFirstYear}>
          <option value={possible_years[0]}>Select a year</option>
          {possible_years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div><div className='col-md-2 mt-auto'>
        <div className='form-group'>
          <label htmlFor='lastYear'>Last Year</label>
          <select className='form-control' name='lastYear' value={lastYearValue} onChange={onChangeLastYear}>
            <option value=''>Select a year</option>
            {possible_years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div></>
  );
}

export default Function;