import React from 'react';

const YearFilter = ({possible_years, firstYear, lastYear, setFirstYear, setLastYear, setSearchChanged}) => {
	const current_year = new Date().getFullYear();

	console.log('YearFilter rendering with:', { possible_years, firstYear, lastYear });

	const onChangeFirstYear = (e) => {
		setFirstYear(e.target.value);
		setSearchChanged(true);
	};
	
	const onChangeLastYear = (e) => {
		setLastYear(e.target.value);
		setSearchChanged(true);
	};

	return (
		<div className="year-filter-container" style={{width: '100%', maxWidth: '100%'}}>
			<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '8px', width: '100%', maxWidth: '100%'}}>
				<div style={{flex: '1 1 0%', minWidth: '0', maxWidth: '50%'}}>
					<label htmlFor='firstYear' className='form-label fw-semibold text-white mb-2'>
						<span className='d-none d-md-inline'>Filter by 1st Year</span>
						<span className='d-md-none'>1st Year</span>
					</label>
					<select 
						id='firstYear' 
						value={firstYear} 
						onChange={onChangeFirstYear}
						style={{ 
							backgroundColor: '#ffffff', 
							color: '#212529', 
							border: '2px solid #afb8c1',
							borderRadius: '6px',
							padding: '0.375rem 0.5rem',
							width: '100%',
							fontSize: '0.875rem'
						}}
					>
						<option value={possible_years[0]}>Select</option>
						{possible_years.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
				<div style={{flex: '1 1 0%', minWidth: '0', maxWidth: '50%'}}>
					<label htmlFor='lastYear' className='form-label fw-semibold text-white mb-2'>
						<span className='d-none d-md-inline'>Filter by Last Year</span>
						<span className='d-md-none'>Last Year</span>
					</label>
					<select 
						id='lastYear' 
						value={lastYear} 
						onChange={onChangeLastYear}
						style={{ 
							backgroundColor: '#ffffff', 
							color: '#212529', 
							border: '2px solid #afb8c1',
							borderRadius: '6px',
							padding: '0.375rem 0.5rem',
							width: '100%',
							fontSize: '0.875rem'
						}}
					>
						<option value={current_year}>Select</option>
						{possible_years.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};

export default YearFilter;