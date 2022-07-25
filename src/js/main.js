import "normalize.css";
// import memoizerific from "memoizerific";
import { value } from "./pubsub";
import Loop from "raf-loop";
import {
  deg2rad,
  listenCb,
  mapRange,
  tickUpdate,
  videoPlaying,
  webcam,
} from "./utils";
import * as Pose from "./pose";
import { bootstrapPrimitives } from "./primitives";
import { createPalette } from "./colours";
import { KEYPOINTS } from "./constants";
import { Point } from "./point";

// const DRAW = [
//   "left_ear",
//   "left_shoulder",
//   "left_elbow",
//   "left_wrist",
//   "left_hip",
//   "left_knee",
//   "right_knee",
//   "right_hip",
//   "right_wrist",
//   "right_elbow",
//   "right_shoulder",
//   "right_ear",
// ];
const DRAW = [
  "left_ear",
  // "left_shoulder",
  // "left_elbow",
  "left_wrist",
  // "left_hip",
  "left_knee",
  "right_knee",
  // "right_hip",
  "right_wrist",
  // "right_elbow",
  // "right_shoulder",
  "right_ear",
];

(async () => {
  const canvas = document.getElementById("canvas");
  const ctx = bootstrapPrimitives(canvas.getContext("2d"));
  const video = document.querySelector("video");

  const WIDTH = value(window.innerWidth);
  const HEIGHT = value(window.innerHeight);

  const VIDEO_WIDTH = value(0);
  const VIDEO_HEIGHT = value(0);
  const ACTUAL_VIDEO_WIDTH = value(0);
  const ACTUAL_VIDEO_HEIGHT = value(0);

  const mouseX = value(0);
  const mouseY = value(0);

  let palette = createPalette(ctx, HEIGHT.get());

  const keypoints = KEYPOINTS.reduce((p, c) => {
    return {
      ...p,
      [c]: Point(WIDTH.get() / 2, HEIGHT.get() / 2),
    };
  }, {});

  const resize = (width = 480, height = 480) => {
    const dpr = window.devicePixelRatio;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  };

  const preload = async () => {
    // const stream = await webcam();
    // video.srcObject = stream;
    await video.play();

    return [Pose.setup(), videoPlaying(video)];
  };

  const setup = async () => {
    resize(WIDTH.get(), HEIGHT.get());

    WIDTH.on("change", () => {
      resize(WIDTH.get(), HEIGHT.get());
    });
    VIDEO_WIDTH.on("change", () => {
      if (VIDEO_HEIGHT.get() > VIDEO_WIDTH.get()) {
        ACTUAL_VIDEO_WIDTH.set(
          (HEIGHT.get() / VIDEO_HEIGHT.get()) * VIDEO_WIDTH.get()
        );
        ACTUAL_VIDEO_HEIGHT.set(HEIGHT.get());
      } else {
        ACTUAL_VIDEO_HEIGHT.set(
          (WIDTH.get() / VIDEO_WIDTH.get()) * VIDEO_HEIGHT.get()
        );
        ACTUAL_VIDEO_HEIGHT.set(WIDTH.get());
      }
    });

    listenCb(
      canvas,
      "mousemove",
      tickUpdate((e) => {
        mouseX.set(e.offsetX);
        mouseY.set(e.offsetY);
      })
    );

    listenCb(document, "click", () => {
      palette = createPalette(ctx, HEIGHT.get());
    });

    listenCb(
      window,
      "resize",
      tickUpdate(() => {
        HEIGHT.set(window.innerHeight);
        WIDTH.set(window.innerWidth);
      })
    );

    // video.play();
    loop.start();

    VIDEO_HEIGHT.set(video.videoHeight);
    VIDEO_WIDTH.set(video.videoWidth);
  };

  const vw = (wid) => {
    if (VIDEO_HEIGHT.get() > VIDEO_WIDTH.get()) {
      const diff = WIDTH.get() - ACTUAL_VIDEO_WIDTH.get();
      return (
        mapRange(wid, 0, VIDEO_WIDTH.get(), 0, ACTUAL_VIDEO_WIDTH.get()) +
        diff / 2
      );
    }

    return mapRange(wid, 0, VIDEO_WIDTH.get(), 0, WIDTH.get());
  };
  //  (wid / VIDEO_WIDTH.get()) * WIDTH.get();
  const vh = (hei) => {
    if (VIDEO_HEIGHT.get() > VIDEO_WIDTH.get()) {
      return mapRange(hei, 0, VIDEO_HEIGHT.get(), 0, HEIGHT.get());
    }

    const diff = HEIGHT.get() - ACTUAL_VIDEO_HEIGHT.get();
    return (
      mapRange(hei, 0, VIDEO_HEIGHT.get(), 0, ACTUAL_VIDEO_HEIGHT.get()) +
      diff / 2
    );
  };
  //(WIDTH.get() / VIDEO_WIDTH.get()) * hei;

  const update = async () => {
    const poses = await Pose.estimate(video);

    const centre = {
      x: WIDTH.get() / 2,
      y: HEIGHT.get() / 2,
    };

    ctx.save();
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, WIDTH.get(), HEIGHT.get());

    poses[0].keypoints.forEach(({ x, y, name, score }) => {
      if (score > 0.6) {
        keypoints[name].set(vw(x), vh(y));
      }
      keypoints[name].update();
    });

    DRAW.forEach((name, idx, arr) => {
      ctx.fillStyle = palette.get(idx);
      const last =
        idx > 0 ? keypoints[arr[idx - 1]] : keypoints[arr[arr.length - 1]];

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(keypoints[name].x, keypoints[name].y);
      // ctx.lineTo(WIDTH.get(), HEIGHT.get() / 2);
      ctx.lineTo(...keypoints[name].project(centre, WIDTH.get() * 2));
      ctx.lineTo(...last.project(centre, WIDTH.get() * 2));
      ctx.closePath();
      ctx.fill();
    });
  };

  const loop = Loop(update);

  await preload();
  setup();
})();
