import type React from "react";
import { getDefaultStore, type PrimitiveAtom } from "jotai";
import useResizeObserver from "@react-hook/resize-observer";

export interface CanvasInfo {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}
export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export interface UseSetCanvasInfoConfig {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasInfo: (canvasInfo: CanvasInfo) => void;
}
export function useSetCanvasInfo({
  canvasRef,
  setCanvasInfo,
}: UseSetCanvasInfoConfig) {
  // 처음 한 번은 무조건 불릴 것이라 기대할 수 있음
  // https://drafts.csswg.org/resize-observer/#ref-for-element%E2%91%A3
  // > Observation will fire when observation starts if Element is being rendered, and Element’s size is not 0,0.
  useResizeObserver(canvasRef, ({ contentRect: { width, height } }) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    setCanvasInfo({ canvas, width, height });
  });
}

export interface CanvasFns {
  clearDrawFns: () => void;
  updateDrawFn: (order: number, drawFn: DrawFn) => void;
  dispose: () => void;
}
export interface CreateCanvasFnsConfig {
  canvasInfoAtom: PrimitiveAtom<CanvasInfo | undefined>;
  devicePixelRatioAtom: PrimitiveAtom<number>;
}
export function createCanvasFns({
  canvasInfoAtom,
  devicePixelRatioAtom,
}: CreateCanvasFnsConfig): CanvasFns {
  const store = getDefaultStore();
  let rafId: number | null = null;
  const drawFns: (DrawFn | undefined)[] = [];
  const clearDrawFns = () => void (drawFns.length = 0);
  const updateDrawFn = (order: number, drawFn: DrawFn) => {
    drawFns[order] = drawFn;
    if (rafId == null) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const screenCanvasInfo = store.get(canvasInfoAtom);
        if (!screenCanvasInfo) return;
        const { canvas, width, height } = screenCanvasInfo;
        const devicePixelRatio = store.get(devicePixelRatioAtom);
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        for (const drawFn of drawFns) {
          ctx.save();
          drawFn?.(ctx);
          ctx.restore();
        }
      });
    }
  };
  const dispose = () => rafId != null && cancelAnimationFrame(rafId);
  return { clearDrawFns, updateDrawFn, dispose };
}
