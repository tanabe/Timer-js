//yes. this is experiment.
//using JohnnyDepp interface
if (window.JD) {
  JD.require(
    "EventDispatcher.js",
    function() {
      try {
        Timer.onInit();
      } catch (e) {

      }
    }
  )("Timer.js");
}

/**
 * Timer Class
 * extends EventDispatcher
 * 
 * (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 * Licensed under the MIT License.
 *
 * usage:
 * var timer = new Timer(1000, 3);
 * timer.addEventListener("timer", this, function() {
 *   console.log("hello");
 * });
 * timer.addEventListener("complete", this, function() {
 *   console.log("done");
 * });
 * timer.start();
 */
(function(window) {

  /**
   * Timer constructor 
   * @name Timer
   * @function
   * @param delay delay time
   * @param repeatCount repeat count
   * @return Timer instance
   */
  var Timer = function(delay, repeatCount) {

    /**
     * internal constructor
     * @name initialize
     * @function
     * @param delay time
     * @param repeatCount repeat count
     */
    function initialize(delay, repeatCount) {
      this.currentCount = 0;
      this.delay = delay || 1000;
      this.repeatCount = repeatCount || 0;
      this.running = false;
      this.intervalID = null;
      this.setDelay(delay);
      this.setRepeatCount(repeatCount);
    }

    /**
     * start timer 
     * @name start
     * @function
     */
    function start() {
      var self = this;
      if (!this.running) {
        this.intervalID = setInterval(function() {
          self.count();
        }, this.delay);
        this.running = true;
      }
    }

    /**
     * stop timer 
     * @name stop
     * @function
     */
    function stop() {
      if (this.running) {
        clearInterval(this.intervalID);
        this.running = false;
      }
    }

    /**
     * reset timer 
     * @name reset
     * @function
     */
    function reset() {
      this.currentCount = 0;
    }

    /**
     * return delay 
     * @name getDelay
     * @function
     * @return delay
     */
    function getDelay() {
      return this.delay;
    }

    /**
     * set delay 
     * @name setDelay
     * @function
     * @param delay delay
     * @return success
     */
    function setDelay(delay) {
      this.stop();
      if (delay > 0) {
        this.delay = delay;
        this.start();
        return true;
      }
      return false;
    }

    /**
     * get repeat count
     * @name getRepeatCount
     * @function
     * @return repeat count
     */
    function getRepeatCount() {
      return this.repeatCount;
    }

    /**
     * get count
     * @name getCount
     * @function
     * @return 
     */
    function getCount() {
      return this.currentCount;
    }

    /**
     * set repeat count
     * @name setRepeatCount
     * @function
     * @param repeatCount 
     * @return success
     */
    function setRepeatCount(repeatCount) {
      if (repeatCount >= 0) {
        this.repeatCount = repeatCount;
        return true;
      }
      return false;
    }

    /**
     * check running 
     * @name isRunning
     * @function
     * @return running
     */
    function isRunning() {
      return this.running;
    }

    /**
     * count timer (private)
     * @name count
     * @function
     */
    function count() {
      this.dispatchEvent("timer");
      this.currentCount++;

      if ((this.repeatCount > 0) && this.currentCount >= this.repeatCount) {
        this.dispatchEvent("complete");
        this.reset();
        this.stop();
      }
    }

    //
    var Timer = {};
    EventDispatcher.initialize(Timer);
    Timer.start = start;
    Timer.stop = stop;
    Timer.reset = reset;
    Timer.getDelay = getDelay;
    Timer.setDelay = setDelay;
    Timer.getRepeatCount = getRepeatCount;
    Timer.getCount = getCount;
    Timer.setRepeatCount = setRepeatCount;
    Timer.isRunning = isRunning;
    Timer.count = count;
    Timer.initialize = initialize;
    Timer.initialize(delay, repeatCount);
    return Timer;
  };

  //assign to global
  window.Timer = Timer;
})(window);
