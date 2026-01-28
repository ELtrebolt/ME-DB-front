import React from 'react';
import TagMaker from '../../app/components/TagMaker';

/**
 * Demo wrapper for TagMaker component
 * Uses demo data source instead of API
 */
const DemoTagMaker = (props) => {
  return <TagMaker {...props} dataSource="demo" />;
};

export default DemoTagMaker;
