function drawDot(x, y, size = 1) {
  this.save();
  this.translate(x, y);
  this.beginPath();
  this.arc(0, 0, size, 0, Math.PI * 2);
  this.fill();
  this.restore();
}

export const bootstrapPrimitives = (ctx) => {
  ctx.drawDot = drawDot;
  return ctx;
};
