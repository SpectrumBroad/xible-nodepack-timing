'use strict';

module.exports = (NODE) => {
  let timeout;

  const triggerIn = NODE.getInputByName('trigger');
  triggerIn.on('trigger', (conn, state) => {
    triggerFunction(state);
  });

  const triggerOut = NODE.getOutputByName('trigger');
  const conditionOut = NODE.getOutputByName('condition');
  conditionOut.on('trigger', (conn, state, callback) => {
    const d = getInputTime();

    const now = new Date();
    now.setFullYear(0, 0, 1);

    // calc the difference between the requested time and now
    const diff = d.getTime() - now.getTime();

    // anything within a second equals true
    callback(Math.abs(diff) < 1000);
  });

  const timeOut = NODE.getOutputByName('time');
  timeOut.on('trigger', (conn, state, callback) => {
    callback(getInputTime(NODE));
  });

  const hoursOut = NODE.getOutputByName('hours');
  const minutesOut = NODE.getOutputByName('minutes');
  const secondsOut = NODE.getOutputByName('seconds');

  const numberOutTrigger = (state, callback) => {
    const d = getInputTime(this.node);
    const name = this.name.substring(0, 1).toUpperCase() + this.name.substring(1);
    callback(d[`get${name}`]());
  };

  hoursOut.on('trigger', numberOutTrigger);
  minutesOut.on('trigger', numberOutTrigger);
  secondsOut.on('trigger', numberOutTrigger);

  NODE.on('close', () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  });

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

  function triggerFunction(state) {
    const d = getInputTime();

    const now = new Date();
    now.setFullYear(0, 0, 1);

    // calc the difference between the requested time and now
    const diff = d.getTime() - now.getTime();

    // setTimeout trigger on the difference
    // unless it's this second, than trigger immediately
    if (diff >= 0 && diff < 1000) {
      triggerOut.trigger(state);
    } else if (diff > 0) {
      timeout = setTimeout(() => {
        triggerOut.trigger(state);
      }, diff);
    }
  }

  NODE.on('trigger', (state) => {
    // don't auto trigger if we have an input trigger
    if (triggerIn.isConnected()) {
      return;
    }

    triggerFunction(state);
  });
};
