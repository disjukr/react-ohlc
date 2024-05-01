import React from "react";
import { atom } from "jotai";
import { molecule, use } from "bunshi";
import { useMolecule } from "bunshi/react";

import { ColMolecule } from "./Col";
import { RowMolecule } from "./Row";

export const DrawOrderContext = React.createContext(0);

export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export function useScreenCanvas(fn: DrawFn) {
  const { updateScreenDrawFn } = useMolecule(RowMolecule);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateScreenDrawFn(drawOrder, fn));
}

export function useValueAxisCanvas(fn: DrawFn) {
  const { updateValueAxisDrawFn } = useMolecule(RowMolecule);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateValueAxisDrawFn(drawOrder, fn));
}

export const IndicatorMolecule = molecule(() => {
  const {
    symbolKey,
    interval,
    chartDataAtom: colChartDataAtom,
    zoomAtom: colZoomAtom,
    toScreenXAtom,
    toTimestampAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  } = use(ColMolecule);
  const {
    screenCanvasInfoAtom: rowScreenCanvasInfoAtom,
    valueAxisCanvasInfoAtom: rowValueAxisCanvasInfoAtom,
    focusAtom: rowFocusAtom,
    zoomAtom: rowZoomAtom,
  } = use(RowMolecule);
  const chartDataAtom = atom((get) => {
    const chartData = get(colChartDataAtom);
    if (chartData) return chartData;
    throw new Error("At the indicator level, chart data must exist.");
  });
  const screenCanvasInfoAtom = atom((get) => {
    const screenCanvasInfo = get(rowScreenCanvasInfoAtom);
    if (screenCanvasInfo) return screenCanvasInfo;
    throw new Error("At the indicator level, canvas info must exist.");
  });
  const valueAxisCanvasInfoAtom = atom((get) => {
    const valueAxisCanvasInfo = get(rowValueAxisCanvasInfoAtom);
    if (valueAxisCanvasInfo) return valueAxisCanvasInfo;
    throw new Error("At the indicator level, canvas info must exist.");
  });
  const dataWidthAtom = atom((get) => {
    const zoom = get(colZoomAtom);
    return interval * zoom;
  });
  const toScreenYAtom = atom((get) => {
    const { height } = get(screenCanvasInfoAtom);
    const focus = get(rowFocusAtom);
    const zoom = get(rowZoomAtom);
    return function toScreenY(value: number): number {
      const center = height / 2;
      return (value - focus) * -zoom + center;
    };
  });
  const toValueAtom = atom((get) => {
    const { height } = get(screenCanvasInfoAtom);
    const focus = get(rowFocusAtom);
    const zoom = get(rowZoomAtom);
    return function toValue(screenY: number): number {
      const center = height / 2;
      return (screenY - center) / -zoom + focus;
    };
  });
  return {
    symbolKey,
    interval,
    chartDataAtom,
    screenCanvasInfoAtom,
    valueAxisCanvasInfoAtom,
    dataWidthAtom,
    toScreenXAtom,
    toScreenYAtom,
    toTimestampAtom,
    toValueAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  };
});
