'use strict';

module.exports = (NODE) => {
  const fullDateOut = NODE.getOutputByName('fulldate');

  fullDateOut.on('trigger', (conn, state, callback) => {
    callback(new Date());
  });

  const timeOut = NODE.getOutputByName('time');

  timeOut.on('trigger', (conn, state, callback) => {
    const d = new Date();
    d.setFullYear(0, 0, 1);
    callback(d);
  });

  const yearOut = NODE.getOutputByName('year');
  const monthOut = NODE.getOutputByName('month');
  const dateOut = NODE.getOutputByName('date');
  const hoursOut = NODE.getOutputByName('hours');
  const minutesOut = NODE.getOutputByName('minutes');
  const secondsOut = NODE.getOutputByName('seconds');

  function numberOutTrigger(conn, state, callback) {
    let name = this.name;

    if (name === 'year') {
      name = 'fullYear';
    }

    const d = new Date();
    name = name.substring(0, 1).toUpperCase() + this.name.substring(1);
    callback(d[`get${name}`]());
  }

  yearOut.on('trigger', numberOutTrigger);
  monthOut.on('trigger', numberOutTrigger);
  dateOut.on('trigger', numberOutTrigger);
  hoursOut.on('trigger', numberOutTrigger);
  minutesOut.on('trigger', numberOutTrigger);
  secondsOut.on('trigger', numberOutTrigger);
};
