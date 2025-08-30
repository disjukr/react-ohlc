import React from "react";
import { atom } from "jotai";
import { bunja, Bunja } from "bunja";
import { useBunja } from 'bunja/react';

import { lerp } from "../misc/interpolation";
import { createCanvasFns, type CanvasInfo } from "../misc/canvas";
import { devicePixelRatioBunja } from "../misc/devicePixelRatio";
import type { Data } from "../market-data";
import { OhlcScope } from "../Ohlc";
import { colBunja } from "../col/state";
import { createScopeFromContext } from "bunja/react";

export const DrawOrderContext = React.createContext(0);

export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export function useScreenCanvas(fn: DrawFn) {
  const { updateScreenDrawFn } = useBunja(rowBunja);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateScreenDrawFn(drawOrder, fn));
}

export function useValueAxisCanvas(fn: DrawFn) {
  const { updateValueAxisDrawFn } = useBunja(rowBunja);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateValueAxisDrawFn(drawOrder, fn));
}

export const RowContext = React.createContext(0);
export const RowScope = createScopeFromContext(RowContext);

export const rowBunja = bunja(
  () => {
    const store = bunja.use(OhlcScope);
    const { devicePixelRatioAtom } = bunja.use(devicePixelRatioBunja);
    const {
      interval,
      chartDataAtom,
      colWidthAtom,
      minScreenTimestampAtom,
      maxScreenTimestampAtom,
    } = bunja.use(colBunja);
    const RowContext = bunja.use(RowScope);
    const readyToDrawAtom = atom((get) => {
      const chartData = get(chartDataAtom);
      const colWidth = get(colWidthAtom);
      const screenCanvasInfo = get(screenCanvasInfoAtom);
      return Boolean(chartData && colWidth && screenCanvasInfo);
    });
    const screenCanvasInfoAtom = atom<CanvasInfo | undefined>(undefined);
    const valueAxisCanvasInfoAtom = atom<CanvasInfo | undefined>(undefined);
    const {
      clearDrawFns: clearScreenDrawFns,
      updateDrawFn: updateScreenDrawFn,
      dispose: disposeScreenCanvasFns,
    } = createCanvasFns({
      store,
      canvasInfoAtom: screenCanvasInfoAtom,
      devicePixelRatioAtom,
    });
    const {
      clearDrawFns: clearValueAxisDrawFns,
      updateDrawFn: updateValueAxisDrawFn,
      dispose: disposeValueAxisCanvasFns,
    } = createCanvasFns({
      store,
      canvasInfoAtom: valueAxisCanvasInfoAtom,
      devicePixelRatioAtom,
    });
    /**
     * focus와 zoom값을 자료와 화면에 맞춰 자동으로 결정할지 여부
     */
    const autoAtom = atom(true);
    /**
     * 세로축의 중심이 가져야 할 값
     */
    const focusAtom = atom((get) => {
      const auto = get(autoAtom);
      const focusSource = get(focusSourceAtom);
      const minScreenValue = get(minScreenValueAtom);
      const maxScreenValue = get(maxScreenValueAtom);
      if (!auto) return focusSource;
      return lerp(maxScreenValue, minScreenValue, 0.5);
    });
    const focusSourceAtom = atom(0);
    /**
     * 세로축의 단위는 픽셀인데 여기에 얼마를 곱할지
     */
    const zoomAtom = atom((get) => {
      const auto = get(autoAtom);
      const screenCanvasInfo = get(screenCanvasInfoAtom);
      const zoomSource = get(zoomSourceAtom);
      const minScreenValue = get(minScreenValueAtom);
      const maxScreenValue = get(maxScreenValueAtom);
      if (!auto || !screenCanvasInfo) return zoomSource;
      const { height: canvasHeight } = screenCanvasInfo;
      const dataHeight = maxScreenValue - minScreenValue;
      return (canvasHeight * 0.6) / dataHeight;
    });
    const zoomSourceAtom = atom(1);
    const minScreenValueAtom = atom((get) => {
      const reduceInnerData = get(reduceInnerDataAtom);
      return reduceInnerData(
        (prev, { low }) => (prev < low ? prev : low),
        Infinity
      );
    });
    const maxScreenValueAtom = atom((get) => {
      const reduceInnerData = get(reduceInnerDataAtom);
      return reduceInnerData(
        (prev, { high }) => (prev > high ? prev : high),
        -Infinity
      );
    });
    const reduceInnerDataAtom = atom((get) => {
      const chartData = get(chartDataAtom);
      const minScreenTimestamp = get(minScreenTimestampAtom);
      const maxScreenTimestamp = get(maxScreenTimestampAtom);
      const start = Math.round(minScreenTimestamp / interval);
      const end = Math.round(maxScreenTimestamp / interval);
      return function reduceInnerData<T>(
        fn: (prev: T, curr: Data) => T,
        initial: T
      ): T {
        let acc = initial;
        if (!chartData) return acc;
        for (let i = start; i < end; ++i) {
          const timestamp = i * interval;
          const data = chartData.raw[timestamp];
          if (!data) continue;
          acc = fn(acc, data);
        }
        return acc;
      };
    });
    bunja.effect(() => {
      return () => {
        disposeScreenCanvasFns();
        disposeValueAxisCanvasFns();
      };
    });
    return {
      readyToDrawAtom,
      autoAtom,
      focusAtom,
      focusSourceAtom,
      zoomAtom,
      zoomSourceAtom,
      screenCanvasInfoAtom,
      valueAxisCanvasInfoAtom,
      clearScreenDrawFns,
      updateScreenDrawFn,
      clearValueAxisDrawFns,
      updateValueAxisDrawFn,
    };
  }
);
