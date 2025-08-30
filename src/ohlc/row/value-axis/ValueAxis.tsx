import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useBunja } from "bunja/react";

import { useSetCanvasInfo } from "../../misc/canvas";
import { colBunja } from "../../col/state";
import { indicatorBunja } from "../../indicator";
import { rowBunja, useValueAxisCanvas } from "../state";
import { ValueAxisBunja, valueAxisFont } from "./state";

export const ValueAxis = React.memo(function ValueAxis() {
  const { readyToDrawAtom } = useBunja(rowBunja);
  const readyToDraw = useAtomValue(readyToDrawAtom);
  if (!readyToDraw) return null;
  return <ValueAxisInternal />;
});

const ValueAxisInternal = function ValueAxisInternal() {
  const { valueAxisWidthAtom } = useBunja(colBunja);
  const { valueAxisCanvasInfoAtom } = useBunja(rowBunja);
  const { screenCanvasInfoAtom } = useBunja(indicatorBunja);
  const width = useAtomValue(valueAxisWidthAtom);
  const { height } = useAtomValue(screenCanvasInfoAtom);
  const setCanvasInfo = useSetAtom(valueAxisCanvasInfoAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useSetCanvasInfo({ setCanvasInfo, canvasRef });
  return <canvas ref={canvasRef} style={{ width, height }} />;
};

export function ValueAxisContent() {
  const { labelValueAndTextsAtom } = useBunja(ValueAxisBunja);
  const { toScreenYAtom } = useBunja(indicatorBunja);
  const labelValueAndTexts = useAtomValue(labelValueAndTextsAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  useValueAxisCanvas((ctx) => {
    ctx.font = valueAxisFont;
    for (const { value, text } of labelValueAndTexts) {
      const y = toScreenY(value);
      ctx.fillText(text, 0, y);
    }
  });
  return null;
}
