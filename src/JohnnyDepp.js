/**
 * command pattern like library
 * (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 * Licensed under the MIT License.
 */
(function(window) {

  /**
   * Process class constructor
   * @name Process
   * @class
   * @return Process class
   */
  var Process = function() {

    var result = {};
    var callbacks = [];

    /**
     * execute process abstract function
     * @name execute
     * @function
     */
    function execute() {
      done();
    }

    /**
     * pause process abstract function 
     * @name pause
     * @function
     */
    function pause() {
    }

    /**
     * reusme process abstract function
     * @name resume
     * @function
     */
    function resume() {
    }

    /**
     * done
     * @name done
     * @function
     */
    function done() {
      //fire callbacks
      for (var i = 0, length = callbacks.length; i < length; i++) {
        callbacks[i].callback.apply(callbacks[i].scope, [this]);
      }
    }

    /**
     * set result object
     * @name setResult
     * @function
     * @param result result object
     */
    function setResult(result) {
      this.result = result;
    }

    /**
     * set callback function
     * @name addCallback
     * @function
     * @param scope owner of callback function
     * @param callback this function will fire after previous process
     */
    function addCallback(scope, callback) {
      callbacks.push({scope: scope, callback: callback});
    }

    /**
     * unset callback function
     * @name removeCallback
     * @function
     * @param callback callback function
     */
    function removeCallback(callback) {
      for (var i = 0, length = callback.length; i < length; i++) {
        if (callbacks[i].callback == callback) {
          callbacks.splice(i, 1);
          return;
        }
      }
    }

    //create inner object
    var Process = {};
    Process.result = result;
    Process.execute = execute;
    Process.pause = pause;
    Process.resume = resume;
    Process.done = done;
    Process.setResult = setResult;
    Process.addCallback = addCallback;
    Process.removeCallback = removeCallback;
    return Process;
  };

  /**
   * Processor class extends Process
   * @name Processor
   * @class
   */
  var Processor = function() {

    var processQueue = [];
    var currentProcesses = [];
    var running = false;
    var executed = false;
    var leftProcessesTotal = 0;
    var total = 0;
    var runningProcessor = null;

    /**
     * 
     * @name execute
     * @function
     */
    function execute() {
      if (executed) {
        return;
      }
      running = true;
      executed = true;
      this.executeProcesses();
    }

    /**
     * execute processes
     * @name executeProcesses
     * @function
     * @return 
     */
    function executeProcesses() {
      if (processQueue.length > 0) {
        currentProcesses = processQueue.shift();
        leftProcessesTotal = currentProcesses.length;
        for (var i = 0, length = currentProcesses.length; i < length; i++) {
          var process = currentProcesses[i];
          process.setResult(this.result);
          process.addCallback(this, processCompleteHandler);
          if (process.isProcessor) {
            runningProcessor = process;
          }
          process.execute();
        }
      } else {
        this.done();
      }
    }

    /**
     * process complete handler
     * @name processCompleteHandler
     * @function
     * @param process process
     */
    function processCompleteHandler(process) {
      process.removeCallback(arguments.callee);
      leftProcessesTotal--;
      if (leftProcessesTotal === 0) {
        currentProcesses = [];
        this.executeProcesses();
      }
    }

    /**
     * add process to end of the queue 
     * @name add
     * @function
     * @param any processes (arguments)
     * @return self
     */
    function add() {
      processQueue.push([].slice.call(arguments));
      return this;
    }

    /**
     * add process to start of the queue
     * @name insertBefore
     * @function
     * @param any processes (arguments)
     * @return self
     */
    function insertBefore() {
      processQueue.unshift([].slice.call(arguments));
      return this;
    }

    /**
     * pause processes
     * @name pauseProcesses
     * @function
     */
    function pauseProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].pause();
      }
    }

    /**
     * resume processes
     * @name resumeProcesses
     * @function
     */
    function resumeProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].resume();
      }
    }

    /**
     * get running child processor
     * @name getRunningProcessor
     * @function
     * @return running child processor
     */
    function getRunningProcessor() {
      return runningProcessor;
    }

    //create inner object
    var Processor = new Process();
    Processor.execute = execute;
    Processor.executeProcesses = executeProcesses;
    Processor.add = add;
    Processor.insertBefore = insertBefore;
    Processor.processCompleteHandler = processCompleteHandler;
    Processor.pauseProcesses = pauseProcesses;
    Processor.getRunningProcessor = getRunningProcessor;
    Processor.isProcessor = true;
    return Processor;
  }

  //assign to global
  window.Process = Process;
  window.Processor = Processor;
})(window);

/**
 *  Johnny Depp is cool actor
 *  (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 *  Licensed under the MIT License.
 */
(function(window) {
  var loadedScripts = [];
  var context = "";
  var running = false;
  var rootProcessor = new Processor();
  var lastProcessor = null;

  /**
   * exchange relative path to absolute path
   * @name relativeToAbsolute
   * @function
   * @param base base absolute path
   * @param target target relative path
   * @return relative path
   */
  var relativeToAbsolute = function(base, target) {
    var result = base.match(/^\/.*\//)[0];
    var tree = target.split(/\//);
    var fileName = tree.pop();
    while (tree.length > 0) {
      var next = tree.shift();
      if (/^\.\.$/.test(next)) {
        result = result.replace(/[^\/]+\/$/, "");
      } else {
        result += next + "/";
      }
    }
    result += fileName;
    return result;
  };

  /**
   * get absolute path
   * @name getAbsolutePath
   * @function
   * @param path 
   * @return absolute path
   */
  var getAbsolutePath = function(path) {
    var tempAnchor = document.createElement("a");
    tempAnchor.href = path;
    //FIXME for IE6..7
    if (!tempAnchor.href.match(/^http/)) {
      var url = location.href.toString().match(/(^.*\/)/)[1];
      return url + path;
    }
    return tempAnchor.href;
  };

  /**
   * remove protocol from url
   * @name removeProtocol
   * @function
   * @param url url
   * @return url
   */
  var removeProtocol = function(url) {
    return url.match(/^[^\/]+:(.*)/)[1];
  };

  /**
   * remove file name from path
   * @name removeFileName
   * @function
   * @param path 
   * @return file name remove path
   */
  var removeFileName = function(path) {
    return path.match(/^(.*\/)/)[1];
  };

  /**
   * load script file
   * @name loadScript
   * @function
   * @param path file path
   * @param next callback
   */
  var loadScript = function(path, next) {
    var fileName = path.match(/\/?([^\/]+\.js$)/)[1];

    //absolute path
    if (/^(\/|(https?))/.test(path)) {
      //context = "";
    //relative path
    } else {
      if (context) {
        path = relativeToAbsolute(context, path);
      } else {
        //remove protocol
        context = removeProtocol(getAbsolutePath(path));//.match(/^[^\/]+:(.*)/)[1];
        //context = path.match(new RegExp("(^.*)" + fileName))[1];
      }
    }

    //check cache
    var fileURI = getAbsolutePath(path);
    //TODO use Array.indexOf
    for (var i = 0; i < loadedScripts.length; i++) {
      if (loadedScripts[i] === fileURI) {
        next();
        return;
      }
    }

    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path;

    //except IE
    if (script.addEventListener) {
      script.addEventListener("load", function() {
        loadedScripts.push(this.src);
        next();
      }, false);
    //IE does not work onload event, instead of use onreadystatechange
    } else if (script.attachEvent) {
      script.onreadystatechange  =  function() {
        if (this.readyState === "loaded" || this.readyState === "complete") {
          this.onreadystatechange = null;
          next();
        }
      };
    } else {
      script.onload = function() {
        next();
      };
    }
    document.getElementsByTagName("head")[0].appendChild(script);
  };

  /**
   * initialize
   * @name initialize
   * @function
   */
  var initialize = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();

    var localProcessor = new Processor();
    var onLoadProcess = new Process();
    onLoadProcess.execute = function() {
      callback();
      this.done();
    };

    var processes = [];
    for (var i = 0; i < args.length; i++) {
      var path = args[i];
      var process = new Process();
      process.path = path;
      process.execute = function() {
        var self = this;
        loadScript(self.path, function() {
          self.done();
        });
      };

      //parallel, concurrency test
      processes.push(process);
    }

    localProcessor.addCallback(null, function() {
    });

    //parallel, concurrency test
    localProcessor.add.apply(localProcessor, processes);
    localProcessor.add(onLoadProcess);

    if (!running) {
      rootProcessor.insertBefore(localProcessor);
      rootProcessor.addCallback(null, function() {
        running = false;
      });
      rootProcessor.execute();
    } else {
      lastProcessor.insertBefore(localProcessor);
    }
    running = true;
    lastProcessor = localProcessor;
  };

  //apply to global
  window.JD = {
    /**
     * require interface
     * @name require
     * @function
     */
    require: function() {
      var args = Array.prototype.slice.call(arguments);
      if (context) {
        initialize.apply(null, args);
      }

      //if not set context, set context
      return function(path) {
        JD.setContext(path);
        initialize.apply(null, args);
      };
    },

    /**
     * set context
     * @name setContext
     * @function
     * @param path root path
     */
    setContext: function(path) {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.match(new RegExp(path + "$"))) {
          //FIXME IE6..7 is script.src returns relative path ex) foo/bar.js
          //then using getAbsolutePath
          context = removeFileName(removeProtocol(getAbsolutePath(scripts[i].src)));
        }
      }
    }

  };
})(window);
