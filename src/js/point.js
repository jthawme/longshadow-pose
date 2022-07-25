import { value } from "./pubsub";
import { lerp } from "./utils";

export const Point = (initialX, initialY) => {
  const x = value(initialX);
  const y = value(initialY);

  const targetX = value(initialX);
  const targetY = value(initialY);

  return {
    angleFrom({ x: _x, y: _y }) {
      return Math.atan2(y.get() - _y, x.get() - _x);
    },
    project(centre, radius) {
      return [
        Math.cos(this.angleFrom(centre)) * radius + centre.x,
        Math.sin(this.angleFrom(centre)) * radius + centre.y,
      ];
    },
    update() {
      x.set(lerp(x.get(), targetX.get(), 0.4));
      y.set(lerp(y.get(), targetY.get(), 0.4));
    },
    set(_x, _y) {
      targetX.set(_x);
      targetY.set(_y);
    },
    get x() {
      return x.get();
    },
    get y() {
      return y.get();
    },
  };
};
