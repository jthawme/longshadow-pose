export const tickUpdate = (cb) => {
  let ticking = false;

  const update = (e) => {
    cb(e);
    ticking = false;
  };

  const requestTick = (e) => {
    if (!ticking) {
      requestAnimationFrame(() => update(e));
      ticking = true;
    }
  };

  return requestTick;
};

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

export const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export const timer = (time = 2000, error = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    }, time);
  });
};

export const onWindowResize = (cb) => {
  window.addEventListener("resize", cb, {
    passive: true,
  });

  window.addEventListener("orientationchange", cb, {
    passive: true,
  });

  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
};

export const debounce = (cb, time = 1000) => {
  let timer = 0;

  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb(...arguments);
    }, time);
  };
};

export const throttle = (cb, time = 1000) => {
  let timer;

  return function () {
    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      cb(...arguments);
      timer = undefined;
    }, time);
  };
};

export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = src;
  });
};

export const listenCb = (el, evt, cb, opts = false) => {
  el.addEventListener(evt, cb, opts);
  return () => el.removeEventListener(evt, cb);
};

export const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const deg2rad = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const videoPlaying = (videoEl) => {
  return new Promise((resolve) => {
    const onPlaying = () => {
      videoEl.removeEventListener("playing", onPlaying);
      resolve(videoEl);
    };

    videoEl.addEventListener("canplaythrough", onPlaying);
  });
};

export const webcam = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  return stream;
};
