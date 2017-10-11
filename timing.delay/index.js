'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const clearIn = NODE.getInputByName('clear');
  const msecIn = NODE.getInputByName('msecs');

  const triggerOut = NODE.getOutputByName('done');

  let regTimeouts = [];
  triggerIn.on('trigger', (conn, state) => {
    msecIn.getValues(state)
    .then((delays) => {
      let fromData = false;
      if (!delays.length) {
        fromData = true;
        delays.push(NODE.data.delay || 0);
      }

      delays.forEach((delay) => {
        delay = Math.round(delay);

        NODE.addProgressBar({
          message: (fromData ? null : `waiting for ${delay} msec`),
          percentage: 0,
          updateOverTime: delay,
          timeout: delay + 700
        });

        regTimeouts.push(setTimeout(() => triggerOut.trigger(state), delay));
      });
    });
  });

  clearIn.on('trigger', () => {
    regTimeouts.forEach((regTimeout) => {
      clearTimeout(regTimeout);
    });
    regTimeouts = [];
    NODE.removeAllStatuses();
  });
};
