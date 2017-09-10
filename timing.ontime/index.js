'use strict';

module.exports = (NODE) => {
  let timeouts = [];

  const triggerIn = NODE.getInputByName('trigger');
  triggerIn.on('trigger', (conn, state) => {
    triggerFunction(state);
  });

  const timesIn = NODE.getInputByName('times');

  const triggerOut = NODE.getOutputByName('trigger');
  const conditionOut = NODE.getOutputByName('condition');
  conditionOut.on('trigger', async (conn, state, callback) => {
    const inputTimes = await timesIn.getValues(state);

    const now = new Date();
    now.setFullYear(0, 0, 1);

    for (let i = 0; i < inputTimes.length; i += 1) {
      if (Math.abs(inputTimes[i].getTime() - now.getTime()) < 1000) {
        callback(true);
        return;
      }
    }
    callback(false);
  });

  NODE.on('close', () => {
    timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeouts = [];
  });

  async function triggerFunction(state) {
    const inputTimes = await timesIn.getValues(state);

    const now = new Date();
    now.setFullYear(0, 0, 1);

    inputTimes.forEach((d) => {
      // calc the difference between the requested time and now
      const diff = d.getTime() - now.getTime();

      // setTimeout trigger on the difference
      // unless it's this second, than trigger immediately
      if (diff >= 0 && diff < 1000) {
        triggerOut.trigger(state);
      } else if (diff > 0) {
        timeouts.push(setTimeout(() => {
          triggerOut.trigger(state);
        }, diff));
      }
    });
  }

  NODE.on('trigger', (state) => {
    // don't auto trigger if we have an input trigger
    if (triggerIn.isConnected()) {
      return;
    }

    triggerFunction(state);
  });
};
