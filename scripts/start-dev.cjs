'use strict';

// CRA exits the dev server when stdin ends (see react-scripts start.js). Some
// integrated terminals close stdin immediately, so the server stops right
// after "Starting the development server...". CI=true skips that handler.
process.env.CI = 'true';

require('react-scripts/scripts/start.js');
