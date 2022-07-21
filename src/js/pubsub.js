const fireEvt = (cbArr, data) => {
  cbArr.forEach(({ handler }) => {
    handler(data);
  });
};

export const value = (initialValue) => {
  let _value = initialValue;

  let _evtIdx = 0;
  let subs = {
    change: [],
  };

  const off = (event, _evtIdx) => {
    const cbs = subs[event].slice();
    cbs.splice(
      cbs.findIndex((item) => item.idx === _evtIdx),
      1
    );
    subs[event] = cbs;
  };

  const on = (event = "change", cb = () => {}) => {
    if (subs[event]) {
      subs[event] = [];
    }

    subs[event].push({
      idx: _evtIdx,
      handler: cb,
    });

    _evtIdx++;

    return;
  };

  return {
    on,
    off,
    set(val) {
      const oldVal = _value;
      _value = val;

      fireEvt(subs["change"], {
        value: _value,
        oldValue: oldVal,
      });
    },
    get() {
      return _value;
    },
  };
};
