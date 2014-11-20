(function () {
      window.layOutDay = layOutDay;

      // DOM Elements representing events.
      var elements = [];

      // Event template.
      var eventTemplate = $('#event-template').html();

      // Calendar.
      var calendar = $('.calendar');

      // Maximum width to display events.
      var maxWidth = 600;

      /**
       * Lay out the events on the calendar.
       *
       * @param {object[]} events
       */

      function layOutDay(events) {
        // Clean the calendar.
        clean();

        // Do nothing if it's not a valid array.
        if (!Array.isArray(events)) return;

        // Create a map that will contains the events.
        var map = new Array(721);

        // Prepare events and map.
        events.forEach(function prepareEvents(event) {
          // Prepare map.
          for(var i = event.start; i <= event.end; i++) {
            map[i] = map[i] || [];
            map[i].push(event);
          }

          // Add dimension and neighbours.
          event.dimension = getMaxNeighbours(map, event);
          event.neighbours = getNeighbourgs(map, event);
        });

        // Sort events by range to optimize positionning.
        events.sort(function byRange(a, b) {
          return (b.end - b.start) - (a.end - a.start);
        });

        events.forEach(function (event, idx) {
          // Sort neighbours.
          event.neighbours.sort(function (a, b) {
            return (a.position || 0) - (b.position || 0);
          });

          event.position = event.neighbours.reduce(function (position, neigbour) {
            if (neigbour.position === position) position++;
            return position;
          }, 0);

          event.index = idx;

          if (event.position >= event.dimension) {
            event.dimension = event.position + 1;
          }
        });

        // Sort event by dimensions.
        events.sort(function byDimension(a, b) {
          return b.dimension - a.dimension;
        });

        events.forEach(synchronizeDimension);

        function synchronizeDimension(event) {
          event.neighbours.forEach(function (neigbour) {
            if (neigbour.dimension < event.dimension) {
              neigbour.dimension = event.dimension;
            }
          });
        }

        // Add each event to the calendar.
        events.forEach(createEvent);

        function createEvent(event) {
          if (event.index === 45) console.log(event);
          var w = maxWidth * (1 / event.dimension) - 22;
          var l = maxWidth * (event.position / event.dimension);

          var element = $(eventTemplate);
          element.find('.title').html(event.index);
          element.css('top', event.start + 'px');
          element.css('height', (event.end - event.start - 10) + 'px');
          element.css('width', w);
          element.css('margin-left', l);
          calendar.append(element);
          elements.push(element);
        }

        function getNeighbourgs(map, event) {
          return events.filter(function (ev) {
            return intersects(ev, event);
          });
        }

        function getMaxNeighbours(map, event) {
          return Math.max.apply(null, map.slice(event.start, event.end).map(function (ar) {
            return ar ? ar.length : 0;
          }));
        }

        function intersects(a, b) {
          return !((a.end < b.start) || (b.end < a.start));
        }

        /**
         * Clean the calendar.
         * Remove all elements.
         */

        function clean() {
          elements.forEach(function (element) {
            element.remove();
          });
          elements = [];
        }
      }
    }());
