'use strict';

module.exports = (NODE) => {
  let timeouts = [];
  function clearTimeouts() {
    timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeouts = [];
  }

  const triggerIn = NODE.getInputByName('trigger');
  triggerIn.on('trigger', (conn, state) => {
    triggerFunction(state);
  });

  const clearIn = NODE.getInputByName('clear');
  clearIn.on('trigger', (conn, state) => {
    clearTimeouts();
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
    clearTimeouts();
  });

  /**
   * Sets up the timers for each timesIn input.
   * @param {FlowState} state
   */
  async function triggerFunction(state) {
    const inputTimes = await timesIn.getValues(state);
    const now = new Date();

    inputTimes.forEach((d) => {
      triggerOnDate(d, state, now);
    });
  }

  /**
   * Sets up the timer based on a given date.
   * @param {Date} d A flat time, without a year, month or day.
   * If these are provided anyway, they will not be used.
   * @param {FlowState} state
   * @param {Date} now
   */
  function triggerOnDate(d, state, now) {
    if (!now) {
      now = new Date();
    }

    const todayD = new Date(now);
    todayD.setHours(d.getHours(), d.getMinutes(), d.getSeconds());

    // calc the difference between the requested time and now
    let diff = todayD.getTime() - now.getTime();

    // schedule the next day if the diff is in the past
    if (diff < 0) {
      const nextDay = new Date(todayD);
      nextDay.setDate(nextDay.getDate() + 1);
      diff = nextDay.getTime() - now.getTime();
    }

    const timeout = setTimeout(() => {
      triggerOut.trigger(state);
      timeouts.splice(timeouts.indexOf(timeout), 1);

      // ensure we don't retrigger immediately
      // in case a super fast machine would call this within the same millisecond.
      setTimeout(() => {
        triggerOnDate(d, state);
      }, 60000);
    }, diff);

    timeouts.push(timeout);
  }

  NODE.on('trigger', (state) => {
    // don't auto trigger if we have an input trigger
    if (triggerIn.isConnected()) {
      return;
    }

    triggerFunction(state);
  });
};
