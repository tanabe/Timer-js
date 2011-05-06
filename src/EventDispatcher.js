/**
 *  Custom Event Dispatcher
 *  (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 *  Licensed under the MIT License.
 *
 *  usage:
 *  EventDispatcher.initialize(object);
 *  object.addEventListener("doSomething", this, theHandler);
 *  object.dispatchEvent("doSomething");//theHandler fired
 */
(function(window) {

  /**
   *  internal EventDispatcher object
   */
  var EventDispatcher = {

    /**
     * dispatch event
     * @name dispatchEvent
     * @function
     * @param name event name
     * @param eventObject event object
     */
    dispatchEvent: function(name, eventObject) {
      //console.log("dispatchEvent", name);
      var listeners = this.__events[name];
      if (!listeners) {
        return;
      }
      for (var i = 0, length = listeners.length; i < length; i++) {
        listeners[i].handler.apply(listeners[i].thisObject, [name, this, eventObject]);
      }
    },

    /**
     * add event listener 
     * @name addEventListener
     * @function
     * @param name event name
     * @param thisObject scope of handler
     * @param handler event handler function
     */
    addEventListener: function(name, thisObject, handler) {
      //console.log("addEventListener", name, thisObject, handler);
      if (!this.__events[name]) {
        this.__events[name] = [];
      }

      if (indexOfEventListener(this.__events[name], thisObject, handler) > -1) {
        return;
      } else {
        this.__events[name].push({thisObject: thisObject, handler: handler});
      }
    },

    /**
     * 
     * @name removeEventListener
     * @function
     * @param name event name
     * @param thisObject scope of handler
     * @param handler event handler function
     */
    removeEventListener: function(name, thisObject, handler) {
      //console.log("removeEventListener", this);
      var listeners = this.__events[name];
      var index = indexOfEventListener(this.__events[name], thisObject, handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };

  /**
   * return index of specified event handler
   * @name indexOfEventListener
   * @function
   * @param listeners event listeners
   * @param thisObject scope if handler
   * @param handler event handler function
   * @return index
   */
  var indexOfEventListener = function(listeners, thisObject, handler) {
    for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i]["thisObject"] === thisObject && listeners[i]["handler"] === handler) {
        return i;
      }
    }
    return -1;
  };

  /**
   * add methods for specified object
   * @name initialize
   * @function
   * @param target 
   */
  EventDispatcher.initialize = function(target) {
    target.dispatchEvent = this.dispatchEvent;
    target.addEventListener = this.addEventListener;
    target.removeEventListener = this.removeEventListener;
    target.__events = {};
  };

  //assign to window
  window.EventDispatcher = EventDispatcher;
})(window);
