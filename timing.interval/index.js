'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const clearIn = NODE.getInputByName('clear');
  const msecIn = NODE.getInputByName('msecs');

  const doneOut = NODE.getOutputByName('done');

  const intervalFunction = (state, interval, fromData) => {
    NODE.addProgressBar({
      message: (fromData ? null : `waiting for ${interval} msec`),
      percentage: 0,
      updateOverTime: interval,
      timeout: interval + 700
    });
    doneOut.trigger(state);
  };

  let regIntervals = [];
  triggerIn.on('trigger', (conn, state) => {
    msecIn.getValues(state).then((intervals) => {
      let fromData = false;
      if (!intervals.length) {
        fromData = true;
        intervals.push(NODE.data.interval || 0);
      }

      intervals.forEach((interval) => {
        interval = Math.round(interval);

        NODE.addProgressBar({
          message: (fromData ? null : `waiting for ${interval} msec`),
          percentage: 0,
          updateOverTime: interval,
          timeout: interval + 700
        });

        regIntervals.push(setInterval(() => intervalFunction(state, interval, fromData), interval));
      });
    });
  });

  clearIn.on('trigger', () => {
    // TODO: clear progress bars as well
    regIntervals.forEach((regInterval) => {
      clearInterval(regInterval);
    });
    regIntervals = [];
  });
};
