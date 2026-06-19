const listeners = new Set();

export default {
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  unsubscribe: (fn) => listeners.delete(fn),
  requestScrollToTop: (markHandled) => {
    listeners.forEach((fn) => {
      try {
        fn(markHandled);
      } catch (e) {
        console.warn('backScrollEmitter listener error', e.message);
      }
    });
  }
};
