var KeyedSubscriber = function () {
  var handlers = {};

  return {
    fire: function (key, o) {
      if (handlers[key])
        handlers[key].forEach(function (fn) { fn(o) });
    },
    on: function (key, fn) {
      if (!handlers[key])
        handlers[key] = new Array;

      handlers[key].push(fn);
    }
  }
}

var Subscriber = function () {
  var handlers = [];

  return {
    fire: function (o, thisObj) {
      var scope = thisObj || window;
      handlers.forEach(function (fn) {
        fn.call(scope, o);
      });
    },
    subscribe: function (fn) {
      handlers.push(fn);
    },

    unsubscribe: function (fn) {
      handlers = handlers.filter(
        function (item) {
          if (item !== fn) {
            return item;
          }
        }
      );
    }
  }
};

var Singleton = (function () {
  var instance;

  function createInstance(fn) {
    return fn;
  }

  return {
    getInstance: function (fn) {
      if (!instance) {
        instance = createInstance(fn);
      }
      return instance;
    }
  }
})();