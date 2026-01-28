import React from 'react';
import SearchBar from '../../app/components/SearchBar';

/**
 * Demo wrapper for SearchBar component
 * Uses /demo base path for navigation
 */
const DemoSearchBar = (props) => {
  return <SearchBar {...props} basePath="/demo" />;
};

export default DemoSearchBar;
