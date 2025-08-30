import { atom } from "jotai";
import { bunja } from "bunja";

import { colBunja } from "./col/state";
import { rowBunja } from "./row/state";

export const indicatorBunja = bunja(
  () => {
    const {
      symbolKey,
      interval,
      chartDataAtom: colChartDataAtom,
      zoomAtom: colZoomAtom,
      toScreenXAtom,
      toTimestampAtom,
      minScreenTimestampAtom,
      maxScreenTimestampAtom,
    } = bunja.use(colBunja)
    const {
      screenCanvasInfoAtom: rowScreenCanvasInfoAtom,
      valueAxisCanvasInfoAtom: rowValueAxisCanvasInfoAtom,
      focusAtom: rowFocusAtom,
      zoomAtom: rowZoomAtom,
    } = bunja.use(rowBunja)
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
  }
);
