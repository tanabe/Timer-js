#JavaScript Timer library

##what is it?
This is JavaScript Timer library.  
setInterval wrapper.

##usage
    var timer = new Timer(1000, 3);
    timer.addEventListener("timer", this, function() {
      console.log("hello");
    });
    timer.addEventListener("complete", this, function() {
      console.log("done");
    });
    timer.start();
 
##caution
This library depends on EventDispacher.js
