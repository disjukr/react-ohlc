import singleton from "./singleton";

const ctxSingleton = singleton(
  () => document.createElement("canvas").getContext("2d")!
);
export default function measureText(font: string, text: string): TextMetrics {
  const ctx = ctxSingleton.value;
  ctx.reset();
  ctx.font = font;
  return ctx.measureText(text);
}
