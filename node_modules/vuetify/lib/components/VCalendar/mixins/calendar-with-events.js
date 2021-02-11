// Styles
import "../../../../src/components/VCalendar/mixins/calendar-with-events.sass"; // Directives

import ripple from '../../../directives/ripple'; // Mixins

import CalendarBase from './calendar-base'; // Helpers

import { escapeHTML } from '../../../util/helpers'; // Util

import props from '../util/props';
import { CalendarEventOverlapModes } from '../modes';
import { getDayIdentifier, diffMinutes } from '../util/timestamp';
import { parseEvent, isEventStart, isEventOn, isEventOverlapping } from '../util/events';
const WIDTH_FULL = 100;
const WIDTH_START = 95;
const MINUTES_IN_DAY = 1440;
/* @vue/component */

export default CalendarBase.extend({
  name: 'calendar-with-events',
  directives: {
    ripple
  },
  props: { ...props.events,
    ...props.calendar,
    ...props.category
  },
  computed: {
    noEvents() {
      return this.events.length === 0;
    },

    parsedEvents() {
      return this.events.map(this.parseEvent);
    },

    parsedEventOverlapThreshold() {
      return parseInt(this.eventOverlapThreshold);
    },

    eventTimedFunction() {
      return typeof this.eventTimed === 'function' ? this.eventTimed : event => !!event[this.eventTimed];
    },

    eventCategoryFunction() {
      return typeof this.eventCategory === 'function' ? this.eventCategory : event => event[this.eventCategory];
    },

    eventTextColorFunction() {
      return typeof this.eventTextColor === 'function' ? this.eventTextColor : () => this.eventTextColor;
    },

    eventNameFunction() {
      return typeof this.eventName === 'function' ? this.eventName : (event, timedEvent) => escapeHTML(event.input[this.eventName] || '');
    },

    eventModeFunction() {
      return typeof this.eventOverlapMode === 'function' ? this.eventOverlapMode : CalendarEventOverlapModes[this.eventOverlapMode];
    },

    eventWeekdays() {
      return this.parsedWeekdays;
    },

    categoryMode() {
      return this.type === 'category';
    }

  },
  methods: {
    eventColorFunction(e) {
      return typeof this.eventColor === 'function' ? this.eventColor(e) : e.color || this.eventColor;
    },

    parseEvent(input, index = 0) {
      return parseEvent(input, index, this.eventStart, this.eventEnd, this.eventTimedFunction(input), this.categoryMode ? this.eventCategoryFunction(input) : false);
    },

    formatTime(withTime, ampm) {
      const formatter = this.getFormatter({
        timeZone: 'UTC',
        hour: 'numeric',
        minute: withTime.minute > 0 ? 'numeric' : undefined
      });
      return formatter(withTime, true);
    },

    updateEventVisibility() {
      if (this.noEvents || !this.eventMore) {
        return;
      }

      const eventHeight = this.eventHeight;
      const eventsMap = this.getEventsMap();

      for (const date in eventsMap) {
        const {
          parent,
          events,
          more
        } = eventsMap[date];

        if (!more) {
          break;
        }

        const parentBounds = parent.getBoundingClientRect();
        const last = events.length - 1;
        let hide = false;
        let hidden = 0;

        for (let i = 0; i <= last; i++) {
          if (!hide) {
            const eventBounds = events[i].getBoundingClientRect();
            hide = i === last ? eventBounds.bottom > parentBounds.bottom : eventBounds.bottom + eventHeight > parentBounds.bottom;
          }

          if (hide) {
            events[i].style.display = 'none';
            hidden++;
          }
        }

        if (hide) {
          more.style.display = '';
          more.innerHTML = this.$vuetify.lang.t(this.eventMoreText, hidden);
        } else {
          more.style.display = 'none';
        }
      }
    },

    getEventsMap() {
      const eventsMap = {};
      const elements = this.$refs.events;

      if (!elements || !elements.forEach) {
        return eventsMap;
      }

      elements.forEach(el => {
        const date = el.getAttribute('data-date');

        if (el.parentElement && date) {
          if (!(date in eventsMap)) {
            eventsMap[date] = {
              parent: el.parentElement,
              more: null,
              events: []
            };
          }

          if (el.getAttribute('data-more')) {
            eventsMap[date].more = el;
          } else {
            eventsMap[date].events.push(el);
            el.style.display = '';
          }
        }
      });
      return eventsMap;
    },

    genDayEvent({
      event
    }, day) {
      const eventHeight = this.eventHeight;
      const eventMarginBottom = this.eventMarginBottom;
      const dayIdentifier = getDayIdentifier(day);
      const week = day.week;
      const start = dayIdentifier === event.startIdentifier;
      let end = dayIdentifier === event.endIdentifier;
      let width = WIDTH_START;

      if (!this.categoryMode) {
        for (let i = day.index + 1; i < week.length; i++) {
          const weekdayIdentifier = getDayIdentifier(week[i]);

          if (event.endIdentifier >= weekdayIdentifier) {
            width += WIDTH_FULL;
            end = end || weekdayIdentifier === event.endIdentifier;
          } else {
            end = true;
            break;
          }
        }
      }

      const scope = {
        eventParsed: event,
        day,
        start,
        end,
        timed: false
      };
      return this.genEvent(event, scope, false, {
        staticClass: 'v-event',
        class: {
          'v-event-start': start,
          'v-event-end': end
        },
        style: {
          height: `${eventHeight}px`,
          width: `${width}%`,
          'margin-bottom': `${eventMarginBottom}px`
        },
        attrs: {
          'data-date': day.date
        },
        key: event.index,
        ref: 'events',
        refInFor: true
      });
    },

    genTimedEvent({
      event,
      left,
      width
    }, day) {
      if (day.timeDelta(event.end) <= 0 || day.timeDelta(event.start) >= 1) {
        return false;
      }

      const dayIdentifier = getDayIdentifier(day);
      const start = event.startIdentifier >= dayIdentifier;
      const end = event.endIdentifier > dayIdentifier;
      const top = start ? day.timeToY(event.start) : 0;
      const bottom = end ? day.timeToY(MINUTES_IN_DAY) : day.timeToY(event.end);
      const height = Math.max(this.eventHeight, bottom - top);
      const scope = {
        eventParsed: event,
        day,
        start,
        end,
        timed: true
      };
      return this.genEvent(event, scope, true, {
        staticClass: 'v-event-timed',
        style: {
          top: `${top}px`,
          height: `${height}px`,
          left: `${left}%`,
          width: `${width}%`
        }
      });
    },

    genEvent(event, scopeInput, timedEvent, data) {
      var _this$eventRipple;

      const slot = this.$scopedSlots.event;
      const text = this.eventTextColorFunction(event.input);
      const background = this.eventColorFunction(event.input);
      const overlapsNoon = event.start.hour < 12 && event.end.hour >= 12;
      const singline = diffMinutes(event.start, event.end) <= this.parsedEventOverlapThreshold;
      const formatTime = this.formatTime;

      const timeSummary = () => formatTime(event.start, overlapsNoon) + ' - ' + formatTime(event.end, true);

      const eventSummary = () => {
        const name = this.eventNameFunction(event, timedEvent);

        if (event.start.hasTime) {
          if (timedEvent) {
            const time = timeSummary();
            const delimiter = singline ? ', ' : '<br>';
            return `<strong>${name}</strong>${delimiter}${time}`;
          } else {
            const time = formatTime(event.start, true);
            return `<strong>${time}</strong> ${name}`;
          }
        }

        return name;
      };

      const scope = { ...scopeInput,
        event: event.input,
        outside: scopeInput.day.outside,
        singline,
        overlapsNoon,
        formatTime,
        timeSummary,
        eventSummary
      };
      return this.$createElement('div', this.setTextColor(text, this.setBackgroundColor(background, {
        on: this.getDefaultMouseEventHandlers(':event', nativeEvent => ({ ...scope,
          nativeEvent
        })),
        directives: [{
          name: 'ripple',
          value: (_this$eventRipple = this.eventRipple) != null ? _this$eventRipple : true
        }],
        ...data
      })), slot ? slot(scope) : [this.genName(eventSummary)]);
    },

    genName(eventSummary) {
      return this.$createElement('div', {
        staticClass: 'pl-1',
        domProps: {
          innerHTML: eventSummary()
        }
      });
    },

    genPlaceholder(day) {
      const height = this.eventHeight + this.eventMarginBottom;
      return this.$createElement('div', {
        style: {
          height: `${height}px`
        },
        attrs: {
          'data-date': day.date
        },
        ref: 'events',
        refInFor: true
      });
    },

    genMore(day) {
      var _this$eventRipple2;

      const eventHeight = this.eventHeight;
      const eventMarginBottom = this.eventMarginBottom;
      return this.$createElement('div', {
        staticClass: 'v-event-more pl-1',
        class: {
          'v-outside': day.outside
        },
        attrs: {
          'data-date': day.date,
          'data-more': 1
        },
        directives: [{
          name: 'ripple',
          value: (_this$eventRipple2 = this.eventRipple) != null ? _this$eventRipple2 : true
        }],
        on: {
          click: () => this.$emit('click:more', day)
        },
        style: {
          display: 'none',
          height: `${eventHeight}px`,
          'margin-bottom': `${eventMarginBottom}px`
        },
        ref: 'events',
        refInFor: true
      });
    },

    getVisibleEvents() {
      const start = getDayIdentifier(this.days[0]);
      const end = getDayIdentifier(this.days[this.days.length - 1]);
      return this.parsedEvents.filter(event => isEventOverlapping(event, start, end));
    },

    isEventForCategory(event, category) {
      return !this.categoryMode || typeof category === 'object' && category.categoryName && category.categoryName === event.category || typeof event.category !== 'string' && category === null;
    },

    getEventsForDay(day) {
      const identifier = getDayIdentifier(day);
      const firstWeekday = this.eventWeekdays[0];
      return this.parsedEvents.filter(event => isEventStart(event, day, identifier, firstWeekday));
    },

    getEventsForDayAll(day) {
      const identifier = getDayIdentifier(day);
      const firstWeekday = this.eventWeekdays[0];
      return this.parsedEvents.filter(event => event.allDay && (this.categoryMode ? isEventOn(event, identifier) : isEventStart(event, day, identifier, firstWeekday)) && this.isEventForCategory(event, day.category));
    },

    getEventsForDayTimed(day) {
      const identifier = getDayIdentifier(day);
      return this.parsedEvents.filter(event => !event.allDay && isEventOn(event, identifier) && this.isEventForCategory(event, day.category));
    },

    getScopedSlots() {
      if (this.noEvents) {
        return { ...this.$scopedSlots
        };
      }

      const mode = this.eventModeFunction(this.parsedEvents, this.eventWeekdays[0], this.parsedEventOverlapThreshold);

      const isNode = input => !!input;

      const getSlotChildren = (day, getter, mapper, timed) => {
        const events = getter(day);
        const visuals = mode(day, events, timed, this.categoryMode);

        if (timed) {
          return visuals.map(visual => mapper(visual, day)).filter(isNode);
        }

        const children = [];
        visuals.forEach((visual, index) => {
          while (children.length < visual.column) {
            children.push(this.genPlaceholder(day));
          }

          const mapped = mapper(visual, day);

          if (mapped) {
            children.push(mapped);
          }
        });
        return children;
      };

      const slots = this.$scopedSlots;
      const slotDay = slots.day;
      const slotDayHeader = slots['day-header'];
      const slotDayBody = slots['day-body'];
      return { ...slots,
        day: day => {
          let children = getSlotChildren(day, this.getEventsForDay, this.genDayEvent, false);

          if (children && children.length > 0 && this.eventMore) {
            children.push(this.genMore(day));
          }

          if (slotDay) {
            const slot = slotDay(day);

            if (slot) {
              children = children ? children.concat(slot) : slot;
            }
          }

          return children;
        },
        'day-header': day => {
          let children = getSlotChildren(day, this.getEventsForDayAll, this.genDayEvent, false);

          if (slotDayHeader) {
            const slot = slotDayHeader(day);

            if (slot) {
              children = children ? children.concat(slot) : slot;
            }
          }

          return children;
        },
        'day-body': day => {
          const events = getSlotChildren(day, this.getEventsForDayTimed, this.genTimedEvent, true);
          let children = [this.$createElement('div', {
            staticClass: 'v-event-timed-container'
          }, events)];

          if (slotDayBody) {
            const slot = slotDayBody(day);

            if (slot) {
              children = children.concat(slot);
            }
          }

          return children;
        }
      };
    }

  }
});
//# sourceMappingURL=calendar-with-events.js.map