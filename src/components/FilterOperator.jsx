import React from 'react'

const Function = ({filterOperator, setFilterOperator, setSearchChanged}) => {

  const onChange = (e) => {
    setFilterOperator( e.target.value );
    setSearchChanged(true);
  };

  return (
    <><label htmlFor='filter-operator'>Tags Operator</label>
    <div className="dropdown">
      <select
        placeholder='OR'
        id='filter-operator'
        className='form-control'
        value={filterOperator}
        onChange={onChange}
      >
      <option key='OR' value='OR'>OR</option>
      <option key='AND' value='AND'>AND</option>
      </select>
    </div>
    </>
  )
}

export default Function;