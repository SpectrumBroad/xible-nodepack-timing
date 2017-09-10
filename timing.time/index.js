'use strict';

module.exports = (NODE) => {
  const timeOut = NODE.getOutputByName('time');
  timeOut.on('trigger', (conn, state, callback) => {
    callback(getInputTime());
  });

  const hoursOut = NODE.getOutputByName('hours');
  const minutesOut = NODE.getOutputByName('minutes');
  const secondsOut = NODE.getOutputByName('seconds');

  function numberOutTrigger(conn, state, callback) {
    const d = getInputTime();
    const name = this.name.substring(0, 1).toUpperCase() + this.name.substring(1);
    callback(d[`get${name}`]());
  }

  hoursOut.on('trigger', numberOutTrigger);
  minutesOut.on('trigger', numberOutTrigger);
  secondsOut.on('trigger', numberOutTrigger);

  function getInputTime() {
    const input = NODE.data.time.split(':');

    const d = new Date();
    d.setFullYear(0, 0, 1);
    d.setHours(+input[0]);

    if (input.length > 1) {
      d.setMinutes(+input[1]);
    } else {
      d.setMinutes(0);
    }

    if (input.length > 2) {
      d.setSeconds(+input[2]);
    } else {
      d.setSeconds(0);
    }

    return d;
  }
};
