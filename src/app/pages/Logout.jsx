import React, { useEffect } from 'react';
import constants from '../constants';

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
