/**
 * Created by User on 5/19/14.
 */
var frequencer = function(config) {
        var timerId,
            currentTimer,
            cache = {},
            action = config.action,
            onSuccess =  config.onSuccess,
            onError = config.onError,
            isPromise = function (value) {
              return !!value && typeof value === 'object' && value.hasOwnProperty('done') && value.hasOwnProperty('fail');
            },
            frequencies = Array.isArray(config.frequency)? config.frequency: [config.frequency],
            getMin = function(arr) {
                return Math.min.apply(null, arr);
            },
            getFrequency = function () {
                return getMin(frequencies);
            },
            shouldDoSomethingNow = function(timer) {
                var timerId = timer && timer.id,
                    currentTimerId = currentTimer && currentTimer.id;

                if (currentTimer && (timerId === currentTimerId)) {
                    // it was called by previous iteration
                    activeTask = null;
                    return true;
                } else {
                    if (!timerId) {
                        //  external call
                        if (isWorking()) {
                            return false; // when active call will be done , new step will triggered
                        } else {
                            if (currentTimerId) { // task is not run yet
                                clearTimeout(currentTimerId);
                                currentTimer = null;
                            }
                            return true;
                        }

                    }
                }
            },
            timeBeforeStart =  function() {
                if (isWaiting()) {
                    return currentTimer.frequency - (Date.now() - currentTimer.time);
                } else {
                    return null;
                }
            },
            isWaiting =  function() {
                return currentTimer && (!activeTask || activeTask.state() !== "pending");
            },
            isWorking = function() {
                return activeTask && activeTask.state() === "pending";
            },
            isStopped = function() {
                return !currentTimer && (!activeTask || activeTask.state() !== "pending");
            },
            collectActiveFrequencies =  function() {
                var activeFreq = [];
                frequencies.forEach(function(freq) {
                    if (cache[freq]) {
                        if ((Date.now() - cache[freq])> freq) {
                            cache[freq] = Date.now();
                            activeFreq.push(freq);
                        }
                    }else {
                        cache[freq] = Date.now();
                        activeFreq.push(freq);
                    }
                });
                return activeFreq;
            },
            activeTask,
            iteration = function(timerId) {
               var frequency,
                   result,
                   activeFreq;
               if (shouldDoSomethingNow(timerId)) {
                   frequency = timerId ? getFrequency() : 0;
                   // set timeout for new cycle
                   currentTimer = {};
                   currentTimer.frequency = frequency;
                   currentTimer.time = Date.now();
                   currentTimer.id = setTimeout(function() {
                       activeFreq = collectActiveFrequencies();
                       if (!activeFreq.length) {
                           iteration(currentTimer);
                       } else {
                           result = action(activeFreq); ///  pass frequency array here

                           if (isPromise(result)){
                               activeTask = result;
                               result.done(function (data) {
                                        onSuccess ? onSuccess(data) && iteration(currentTimer) : iteration(currentTimer);
                                   }).fail(function (error) {
                                        onError ? onError(error) && iteration(currentTimer) : iteration(currentTimer);
                                   });
                           } else {
                               onSuccess && onSuccess(result) && iteration(currentTimer);
                           }
                       }
                   }, frequency);
               } else {

               }
            };

        return {
            run : function() {
                cache = {};
                iteration(null);
            },
            setFrequencies: function(newFrequencies) {
                var curMinFreq = getMin(frequencies),
                    newCurMinFreq = getMin(newFrequencies);

                frequencies = newFrequencies;
                if (isWaiting()) {
                    if (newCurMinFreq < curMinFreq && timeBeforeStart() > newCurMinFreq){
                        iteration(null);
                    }
                }
            },
            stop : function () {
                clearTimeout(timerId);
            }
        }
    };
