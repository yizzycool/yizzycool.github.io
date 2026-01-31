export const CustomEvents = {
  common: {
    switchTab: 'common.switch-tab',
    toggleConfigDialog: 'common.toggle-config-dialog',
  },
  tools: {
    fabricRecalcSelection: 'tools.fabric-recalc-selection',
  },
};

const FlattenCustomEvents: string[] = [];
(function deepFlatten(eventObj: object) {
  Object.values(eventObj).map((value) => {
    if (typeof value === 'string') {
      FlattenCustomEvents.push(value);
    } else {
      deepFlatten(value);
    }
  });
})(CustomEvents);

type CustomEventType = (typeof FlattenCustomEvents)[number];

type CustomEventListener = (e: CustomEvent) => void;

type Unsubscriber = () => void;

class HandlerMap {
  #handlerMap;

  constructor() {
    this.#handlerMap = new Map<
      CustomEventType,
      Map<CustomEventListener, EventListener>
    >();
  }

  get(event: CustomEventType, handler: CustomEventListener) {
    return this.#handlerMap.get(event)?.get(handler);
  }

  add(
    event: CustomEventType,
    handler: CustomEventListener,
    wrapper: EventListener
  ) {
    if (!this.#handlerMap.has(event)) {
      this.#handlerMap.set(event, new Map());
    }
    this.#handlerMap.get(event)!.set(handler, wrapper);
  }

  delete(event: CustomEventType, handler: CustomEventListener) {
    const wrappers = this.#handlerMap.get(event);
    const wrapper = wrappers?.get(handler);
    if (!wrapper) return;
    wrappers!.delete(handler);
    if (wrappers!.size === 0) {
      this.#handlerMap.delete(event);
    }
  }
}

const handlerMap = new HandlerMap();

export const customEventUtils = {
  on: (event: CustomEventType, handler: CustomEventListener): Unsubscriber => {
    const wrapper: EventListener = (e) => {
      handler(e as CustomEvent);
    };

    handlerMap.add(event, handler, wrapper);

    window.addEventListener(event, wrapper);
    return () => customEventUtils.off(event, handler);
  },

  once: (event: CustomEventType, handler: CustomEventListener) => {
    const wrapper: EventListener = (e) => {
      handler(e as CustomEvent);
      customEventUtils.off(event, handler);
    };

    handlerMap.add(event, handler, wrapper);

    window.addEventListener(event, wrapper);
  },

  emit: (event: CustomEventType, detail?: object) => {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  },

  off: (event: CustomEventType, handler: CustomEventListener) => {
    const wrapper = handlerMap.get(event, handler);
    if (!wrapper) return;
    handlerMap.delete(event, handler);
    window.removeEventListener(event, wrapper);
  },
};

export default customEventUtils;
