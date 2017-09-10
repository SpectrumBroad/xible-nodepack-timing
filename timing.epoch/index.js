'use strict';

module.exports = (NODE) => {
  const msecOut = NODE.getOutputByName('msec');

  msecOut.on('trigger', (conn, state, callback) => {
    callback(Date.now());
  });
};
