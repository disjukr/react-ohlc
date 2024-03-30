import React from "react";
import { atom } from "jotai";
import { molecule, use } from "bunshi";
import { useMolecule } from "bunshi/react";

import { ColMolecule } from "./Col";
import { RowMolecule } from "./Row";

export const DrawOrderContext = React.createContext(0);

export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export function useDraw(fn: DrawFn) {
  const { updateDrawFn } = useMolecule(RowMolecule);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateDrawFn(drawOrder, fn));
}

export const IndicatorMolecule = molecule(() => {
  const {
    chartDataAtom: colChartDataAtom,
    offsetAtom: colOffsetAtom,
    zoomAtom: colZoomAtom,
    symbolKey,
    interval,
  } = use(ColMolecule);
  const {
    canvasInfoAtom: rowCanvasInfoAtom,
    focusAtom: rowFocusAtom,
    zoomAtom: rowZoomAtom,
  } = use(RowMolecule);
  const chartDataAtom = atom((get) => {
    const chartData = get(colChartDataAtom);
    if (chartData) return chartData;
    throw new Error("At the indicator level, chart data must exist.");
  });
  const canvasInfoAtom = atom((get) => {
    const canvasInfo = get(rowCanvasInfoAtom);
    if (canvasInfo) return canvasInfo;
    throw new Error("At the indicator level, canvas info must exist.");
  });
  const dataWidthAtom = atom((get) => {
    const zoom = get(colZoomAtom);
    return interval * zoom;
  });
  const toScreenXAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    const { width } = get(canvasInfoAtom);
    const offset = get(colOffsetAtom);
    const zoom = get(colZoomAtom);
    return function toScreenX(timestamp: number): number {
      return (chartData.maxTimestamp + offset - timestamp) * -zoom + width;
    };
  });
  const toScreenYAtom = atom((get) => {
    const { height } = get(canvasInfoAtom);
    const focus = get(rowFocusAtom);
    const zoom = get(rowZoomAtom);
    return function toScreenY(value: number): number {
      const center = height / 2;
      return (value - focus) * -zoom + center;
    };
  });
  const toTimestampAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    const { width } = get(canvasInfoAtom);
    const offset = get(colOffsetAtom);
    const zoom = get(colZoomAtom);
    return function toTimestamp(screenX: number): number {
      return chartData.maxTimestamp + offset - (screenX - width) / -zoom;
    };
  });
  const toValueAtom = atom((get) => {
    const { height } = get(canvasInfoAtom);
    const focus = get(rowFocusAtom);
    const zoom = get(rowZoomAtom);
    return function toValue(screenY: number): number {
      const center = height / 2;
      return (screenY - center) / -zoom + focus;
    };
  });
  const minScreenTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    return Math.ceil(toTimestamp(0) / interval) * interval;
  });
  const maxScreenTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    const { width } = get(canvasInfoAtom);
    return Math.ceil(toTimestamp(width) / interval) * interval;
  });
  return {
    symbolKey,
    interval,
    chartDataAtom,
    canvasInfoAtom,
    dataWidthAtom,
    toScreenXAtom,
    toScreenYAtom,
    toTimestampAtom,
    toValueAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  };
});
