import React from 'react';

const FormSelect = ({ 
  label, 
  error, 
  helperText, 
  options = [],
  className = '', 
  selectClassName = '',
  ...props 
}) => {
  const selectClasses = `form-select ${error ? 'is-invalid' : ''} ${selectClassName}`.trim();

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="form-label fw-semibold">
          {label}
        </label>
      )}
      <select className={selectClasses} {...props}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
      {helperText && !error && (
        <div className="form-text">{helperText}</div>
      )}
    </div>
  );
};

export default FormSelect;
