/**
 * Created by User on 5/19/14.
 */

console.log("frequencer here");

var frequencer = function(config) {
       var timerId,
           lastActionTime = Date.now(),
           cache = {},
           isPromise = function (value) {
                return !!value && typeof value === 'object' && value.hasOwnProperty('done') && value.hasOwnProperty('fail');
           },
           action = config.action,
           frequencies = Array.isArray(config.frequency)? config.frequency: [config.frequency],
           getFrequency = function () {
               return Math.min.apply(null, frequencies);
           },
           step = function() {
               var result;
               lastActionTime = Date.now(),
               frequency = getFrequency(),
               activeFreq = [];

               frequencies.forEach(function(freq) {
                    if (cache[freq]) {
                      if ((Date.now() -cache[freq])> freq) {
                          cache[freq] = Date.now();
                          activeFreq.push(freq);
                      }
                    }else {
                      // first run for this value
                      cache[freq] = Date.now();
                      activeFreq.push(freq);
                    }
               });
               timerId = setTimeout(function() {
                  result = action(activeFreq); ///  pass frequency array here
                  if (isPromise(result)){
                     result.done(step);
                  } else {
                     step();
                  }
               }, frequency);
           };


    return {
       run : function() {
           console.log("ran");
           step();
       },
       setFrequency: function() {

       },
       stop : function () {

       },
       attachEvent : function() {

       },
       getFrequncies: function() {
           return frequencies;
       }

    }
};
