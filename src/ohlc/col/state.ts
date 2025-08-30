import React from "react";
import { atom } from "jotai";
import { RESET } from "jotai/utils";
import { bunja } from "bunja";

import { ohlcBunja } from "../Ohlc";
import { createScopeFromContext } from "bunja/react";

export const SymbolKeyContext = React.createContext("");
export const SymbolKeyScope = createScopeFromContext(SymbolKeyContext);
export const IntervalContext = React.createContext(-1);
export const IntervalScope = createScopeFromContext(IntervalContext);

export const colBunja = bunja(
  () => {
    const symbolKey = bunja.use(SymbolKeyScope);
    const interval = bunja.use(IntervalScope);
    const { symbolDataAtomsAtom } = bunja.use(ohlcBunja);
    const chartDataAtom = atom((get) => {
      const symbolDataAtoms = get(symbolDataAtomsAtom);
      const symbolDataAtom = symbolDataAtoms[symbolKey];
      if (!symbolDataAtom) return;
      const symbolData = get(symbolDataAtom);
      const chartDataAtom = symbolData.chartDataAtoms[interval];
      if (!chartDataAtom) return;
      const chartData = get(chartDataAtom);
      return chartData;
    });
    const colWidthAtom = atom<number | undefined>(undefined);
    /**
     * 가로축의 가장 오른쪽은 최신 데이터의 시각이 되도록 할 건데 여기서 얼마나 조정해서 볼지.
     * 단위는 밀리초.
     */
    const offsetAtom = atom(0);
    /**
     * 가로축 기본 단위는 밀리초/픽셀 인데 여기에 얼마를 곱해서 볼건지.
     */
    const zoomAtom = atom((1 / interval) * 7);
    /**
     * 같은 Col 안의 모든 Row는 축 정보 영역의 가로폭 크기를 똑같이 가져가야 하기 때문에 가로폭 상태를 Col에서 관리함.
     */
    const valueAxisWidthAtom = atom(1);
    const valueAxisWidthSetterAtom = atom(
      null,
      (get, set, newValue: number | typeof RESET) => {
        const oldValue = get(valueAxisWidthAtom);
        if (newValue === RESET)
          set(valueAxisWidthAtom, valueAxisWidthAtom.init);
        else if (newValue > oldValue) set(valueAxisWidthAtom, newValue);
      }
    );
    const chartWidthAtom = atom((get) => {
      const colWidth = get(colWidthAtom);
      const valueAxisWidth = get(valueAxisWidthAtom);
      if (!colWidth) return;
      return colWidth - valueAxisWidth;
    });
    const toScreenXAtom = atom((get) => {
      const chartData = get(chartDataAtom);
      const chartWidth = get(chartWidthAtom);
      const offset = get(offsetAtom);
      const zoom = get(zoomAtom);
      if (!chartData) return () => NaN;
      if (!chartWidth) return () => 0;
      return function toScreenX(timestamp: number): number {
        return (
          (chartData.maxTimestamp + offset - timestamp) * -zoom + chartWidth
        );
      };
    });
    const toTimestampAtom = atom((get) => {
      const chartData = get(chartDataAtom);
      const chartWidth = get(chartWidthAtom);
      const offset = get(offsetAtom);
      const zoom = get(zoomAtom);
      return function toTimestamp(screenX: number): number {
        const maxTimestamp = chartData?.maxTimestamp || 0;
        const width = chartWidth || 0;
        return maxTimestamp + offset - (screenX - width) / -zoom;
      };
    });
    const minScreenTimestampAtom = atom((get) => {
      const toTimestamp = get(toTimestampAtom);
      return Math.ceil(toTimestamp(0) / interval) * interval;
    });
    const maxScreenTimestampAtom = atom((get) => {
      const toTimestamp = get(toTimestampAtom);
      const chartWidth = get(chartWidthAtom);
      const width = chartWidth || 0;
      return Math.ceil(toTimestamp(width) / interval) * interval;
    });
    return {
      symbolKey,
      interval,
      chartDataAtom,
      colWidthAtom,
      offsetAtom,
      zoomAtom,
      valueAxisWidthAtom,
      valueAxisWidthSetterAtom,
      chartWidthAtom,
      toScreenXAtom,
      toTimestampAtom,
      minScreenTimestampAtom,
      maxScreenTimestampAtom,
    };
  }
);
