import * as tome from "chromotome";
import chroma from "chroma-js";

//giftcard_sub

export const createPalette = (ctx, height) => {
  const palette = tome.getRandom();
  // const palette = tome.get("giftcard_sub");

  console.log(palette.name);

  const fills = palette.colors
    .filter((c) => {
      return chroma.distance(c, palette.background) > 20;
    })
    .map((color, idx, arr) => {
      console.log(palette.colors.length, arr.length);

      const rgb1 = chroma(color).rgb();
      const rgb2 = chroma(color).brighten(1).rgb();

      const fill = ctx.createLinearGradient(0, 0, 0, height);
      // fill.addColorStop(0, `rgba(${rgb1.join(",")}, 1)`);
      // fill.addColorStop(1, `rgba(${rgb2.join(",")}, 0.6)`);
      fill.addColorStop(0, `rgb(${rgb1.join(",")})`);
      fill.addColorStop(1, `rgb(${rgb2.join(",")})`);

      return fill;
    });

  return {
    fills,
    background: palette.background,
    get(idx) {
      return fills[(idx + fills.length) % fills.length];
    },
  };
};
