import React from 'react';

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseClasses = "btn";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline-primary",
    danger: "btn-danger",
    ghost: "btn-link",
    link: "btn-link",
  };

  const sizes = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
    xl: "btn-lg px-5 py-3 fs-5",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {children}
    </button>
  );
};

export default Button;
