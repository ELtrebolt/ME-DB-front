import React from 'react';

const FormInput = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  inputClassName = '',
  ...props 
}) => {
  const inputClasses = `form-control ${error ? 'is-invalid' : ''} ${inputClassName}`.trim();

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="form-label fw-semibold">
          {label}
        </label>
      )}
      <input 
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
      {helperText && !error && (
        <div className="form-text">{helperText}</div>
      )}
    </div>
  );
};

export default FormInput;
