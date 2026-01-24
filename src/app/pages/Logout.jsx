import React, { useEffect } from 'react';
const constants = require('../constants');

const Logout = () => {
  useEffect(() => {
    window.open(constants['SERVER_URL'] + "/auth/logout", "_self");
  }, []);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
