import React from "react";
import { atom, useAtomValue } from "jotai";
import { molecule, use } from "bunshi";
import { useMolecule } from "bunshi/react";

import { DevicePixelRatioMolecule } from "./misc/devicePixelRatio";
import { ColMolecule } from "./Col";

const timeAxisHeight = 20;

export const TimeAxisMolecule = molecule(() => {
  const { chartWidthAtom, toTimestampAtom } = use(ColMolecule);
  const timeAxisWidthAtom = atom((get) => {
    const chartWidth = get(chartWidthAtom);
    return chartWidth || 0;
  });
  const leftTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    return toTimestamp(0);
  });
  const rightTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    const timeAxisWidth = get(timeAxisWidthAtom);
    return toTimestamp(timeAxisWidth);
  });
  return {
    timeAxisWidthAtom,
    leftTimestampAtom,
    rightTimestampAtom,
  };
});
export const TimeAxis = React.memo(function TimeAxis() {
  const { timeAxisWidthAtom } = useMolecule(TimeAxisMolecule);
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
  const devicePixelRatioAtom = useMolecule(DevicePixelRatioMolecule);
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
