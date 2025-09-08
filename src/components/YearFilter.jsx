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
		<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '16px', width: '100%'}}>
			<div style={{flex: '1 1 0%', minWidth: '0'}}>
				<label htmlFor='firstYear' style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>First Year Filter</label>
				<select 
					id='firstYear' 
					value={firstYear} 
					onChange={onChangeFirstYear}
					style={{ 
						backgroundColor: '#ffffff', 
						color: '#212529', 
						border: '2px solid #afb8c1',
						borderRadius: '6px',
						padding: '0.375rem 0.75rem',
						width: '100%'
					}}
				>
					<option value={possible_years[0]}>Select a year</option>
					{possible_years.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</div>
			<div style={{flex: '1 1 0%', minWidth: '0'}}>
				<label htmlFor='lastYear' style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Last Year Filter</label>
				<select 
					id='lastYear' 
					value={lastYear} 
					onChange={onChangeLastYear}
					style={{ 
						backgroundColor: '#ffffff', 
						color: '#212529', 
						border: '2px solid #afb8c1',
						borderRadius: '6px',
						padding: '0.375rem 0.75rem',
						width: '100%'
					}}
				>
					<option value={current_year}>Select a year</option>
					{possible_years.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default YearFilter;