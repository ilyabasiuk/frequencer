/**
 * Created by User on 5/19/14.
 */

console.log("frequencer here");

var frequencer = function(config) {
       var timerId,
           lastActionTime = Date.now(),
           cache = {},
           eventHandlers = {},
           isPromise = function (value) {
                return !!value && typeof value === 'object' && value.hasOwnProperty('done') && value.hasOwnProperty('fail');
           },
           action = config.action,
           frequencies = Array.isArray(config.frequency)? config.frequency: [config.frequency],
           getFrequency = function () {
               return Math.min.apply(null, frequencies);
           },
           step = function(immediate) {
               var result;
               lastActionTime = Date.now(),
               frequency = immediate?0 :getFrequency(),
               activeFreq = [];

               frequencies.forEach(function(freq) {
                    if (cache[freq]) {
                      if ((Date.now() - cache[freq])> freq) {
                          cache[freq] = Date.now();
                          activeFreq.push(freq);
                      }
                    }else {
                      // first run for this value
                      cache[freq] = Date.now();
                      activeFreq.push(freq);
                    }
               });
               fireEvent("waiting");
               timerId = setTimeout(function() {
                  fireEvent("working");
                  result = action(activeFreq); ///  pass frequency array here
                  if (isPromise(result)){
                     result.done(step);
                  } else {
                     step();
                  }
               }, frequency);
           },
           fireEvent = function(eventName) {
               if (eventHandlers.hasOwnProperty(eventName)){
                   eventHandlers[eventName].forEach(function(callback) {
                       callback();
                   })
               }
           };


    return {
       run : function() {
           console.log("ran");
           step(true);
       },
       setFrequency: function(frequency, immediate) {
           if (frequencies.indexOf(frequency) <0 ) {
               frequencies.push(frequency);
               if (immediate) {
                   clearTimeout(timerId);
                   step(true);
               }
           }
       },
       stop : function () {
           clearTimeout(timerId);
       },
       addEvent : function(eventName, callback) {
           //waiting
           //working
           if (eventHandlers.hasOwnProperty(eventName)){
               eventHandlers[eventName].push(callback);
           } else {
               eventHandlers[eventName] = [callback];
           }
       },
       removeEvent : function(eventName, callback) {
           var i, currentEvent;
           if (eventHandlers.hasOwnProperty(eventName)){
               currentEvent = eventHandlers[eventName];
               if (callback){
                   for (i = 0; i < currentEvent.length; i++){
                       if (currentEvent[i] === callback){
                           currentEvent.splice(i, 1);
                           break;
                       }
                   }
               } else {
                   currentEvent.length = 0;
                   delete eventHandlers[eventName];
               }
           }
       },
       getFrequncies: function() {
           return frequencies;
       }

    }
};
