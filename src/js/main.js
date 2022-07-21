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

(async () => {
  const canvas = document.getElementById("canvas");
  const ctx = bootstrapPrimitives(canvas.getContext("2d"));
  const video = document.querySelector("video");

  const WIDTH = value(480);
  const HEIGHT = value(480);

  const VIDEO_WIDTH = value(0);
  const VIDEO_HEIGHT = value(0);
  const ACTUAL_VIDEO_WIDTH = value(0);
  const ACTUAL_VIDEO_HEIGHT = value(0);

  const mouseX = value(0);
  const mouseY = value(0);

  const palette = createPalette(ctx, HEIGHT.get());

  const resize = (width = 480, height = 480) => {
    const dpr = window.devicePixelRatio;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  };

  const preload = async () => {
    const stream = await webcam();
    video.srcObject = stream;
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

    // if (poses.filter((p) => p.score > 0.5).length === 0) {
    //   return;
    // }

    ctx.save();
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, WIDTH.get(), HEIGHT.get());

    // console.log(poses);

    poses.forEach((pose) => {
      const parts = {
        shoulders: {
          names: ["left_shoulder", "right_shoulder"],
          points: {},
          fill: palette.get(1),
          mod: (x, y, idx) => {
            if (idx === 0) {
              return [x - WIDTH.get(), y + HEIGHT.get()];
            } else {
              return [x + WIDTH.get(), y + HEIGHT.get()];
            }
          },
        },
        forearm2: {
          names: ["left_elbow", "left_wrist"],
          points: {},
          fill: palette.get(0),
          mod: (x, y) => {
            return [x + WIDTH.get(), y + HEIGHT.get()];
          },
        },
        arm2: {
          names: ["left_shoulder", "left_elbow"],
          points: {},
          fill: palette.get(0),
          mod: (x, y) => {
            return [x + WIDTH.get(), y + HEIGHT.get()];
          },
        },
        forearm1: {
          names: ["right_elbow", "right_wrist"],
          points: {},
          fill: palette.get(2),
          mod: (x, y) => {
            return [x - WIDTH.get(), y + HEIGHT.get()];
          },
        },
        arm1: {
          names: ["right_shoulder", "right_elbow"],
          points: {},
          fill: palette.get(2),
          mod: (x, y) => {
            return [x - WIDTH.get(), y + HEIGHT.get()];
          },
        },
      };
      const keys = Object.keys(parts);

      ctx.fillStyle = "black";
      pose.keypoints.forEach(({ x, y, name, score }) => {
        keys.forEach((k) => {
          if (parts[k].names.includes(name)) {
            parts[k].points[parts[k].names.indexOf(name)] = {
              x: vw(x),
              y: vh(y),
            };
          }

          // ctx.drawDot(vw(x), vh(y), 2);
        });
      });

      keys.forEach((k) => {
        const points = Object.values(parts[k].points);

        if (points.length > 1) {
          ctx.fillStyle = parts[k].fill;
          const path = new Path2D();
          points.forEach((pos, idx) => {
            if (idx === 0) {
              path.moveTo(pos.x, pos.y);
            } else {
              path.lineTo(pos.x, pos.y);
            }
          });

          if (parts[k].mod) {
            points.reverse().forEach((pos, idx) => {
              path.lineTo(...parts[k].mod(pos.x, pos.y, idx));
              // path.lineTo(pos.x - WIDTH.get(), pos.y + HEIGHT.get());
            });
          }
          path.closePath();
          ctx.fill(path);
        }
      });
    });
  };

  const loop = Loop(update);

  await preload();
  setup();
})();
