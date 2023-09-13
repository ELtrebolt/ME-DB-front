import React from 'react';

const Function = ({possible_years, firstYear, lastYear, setFirstYear, setLastYear, setSearchChanged}) => {
  const current_year = new Date().getFullYear()

  const onChangeFirstYear = (e) => {
    setFirstYear(e.target.value );
    console.log("First Year Now:", e.target.value);
    setSearchChanged(true);
  };
  
  const onChangeLastYear = (e) => {
    setLastYear(e.target.value );
    console.log("Last Year Now:", e.target.value);
    setSearchChanged(true);
  };

  return (
    <><div className='col-md-2 mt-auto'>
      <div className='form-group'>
        <label htmlFor='firstYear'>First Year</label>
        <select className='form-control' id='firstYear' value={firstYear} onChange={onChangeFirstYear}>
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
          <select className='form-control' id='lastYear' value={lastYear} onChange={onChangeLastYear}>
            <option value={current_year}>Select a year</option>
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