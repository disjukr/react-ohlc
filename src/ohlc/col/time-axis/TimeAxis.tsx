import React from "react";
import { useAtomValue } from "jotai";
import { useBunja } from "bunja/react";

import { devicePixelRatioBunja } from "../../misc/devicePixelRatio";
import { TimeAxisBunja, timeAxisHeight } from "./state";

export const TimeAxis = React.memo(function TimeAxis() {
  const { timeAxisWidthAtom } = useBunja(TimeAxisBunja);
  const timeAxisWidth = useAtomValue(timeAxisWidthAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const width = timeAxisWidth;
  const height = timeAxisHeight;
  useCanvas({
    canvasRef,
    width,
    height,
    render(ctx) {
      ctx.fillRect(0, 0, width, height);
    },
  });
  return (
    <div style={{ position: "relative", height }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", height: "100%" }}
      />
    </div>
  );
});

interface UseCanvasConfig {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  render: (ctx: CanvasRenderingContext2D) => void;
}
function useCanvas({ canvasRef, render, width, height }: UseCanvasConfig) {
  const { devicePixelRatioAtom } = useBunja(devicePixelRatioBunja);
  const devicePixelRatio = useAtomValue(devicePixelRatioAtom);
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.save();
    render(ctx);
    ctx.restore();
  });
}
