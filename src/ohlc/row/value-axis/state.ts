import React from "react";
import { atom } from "jotai";
import { bunja } from "bunja";

import measureText from "../../misc/measureText";
import { OhlcScope } from "../../Ohlc";
import { colBunja } from "../../col/state";
import { indicatorBunja } from "../../indicator";
import { createScopeFromContext } from "bunja/react";

export const valueAxisFontSize = 10;
export const valueAxisFont = `${valueAxisFontSize} sans-serif`;

export type FormatValueFn = (value: number, interval: number) => string;
export const ValueAxisContext = React.createContext<FormatValueFn>(String);
export const ValueAxisScope = createScopeFromContext(ValueAxisContext);
export const ValueAxisBunja = bunja(
  () => {
    const store = bunja.use(OhlcScope);
    const colBunjaInstance = bunja.use(colBunja);
    const formatValue = bunja.use(ValueAxisScope);
    const { toValueAtom, screenCanvasInfoAtom } = bunja.use(indicatorBunja);
    const { valueAxisWidthSetterAtom } = colBunjaInstance;
    const screenHeightAtom = atom((get) => {
      const screenCanvasInfo = get(screenCanvasInfoAtom);
      return screenCanvasInfo.height;
    });
    const topValueAtom = atom((get) => {
      const toValue = get(toValueAtom);
      return toValue(0);
    });
    const bottomValueAtom = atom((get) => {
      const toValue = get(toValueAtom);
      const height = get(screenHeightAtom);
      return toValue(height);
    });
    const labelIntervalAtom = atom((get) => {
      const topValue = get(topValueAtom);
      const bottomValue = get(bottomValueAtom);
      const height = get(screenHeightAtom);
      const size = topValue - bottomValue;
      return getInterval(size, height, valueAxisFontSize, 2.5);
    });
    const labelValuesAtom = atom((get) => {
      const topValue = get(topValueAtom);
      const bottomValue = get(bottomValueAtom);
      const labelInterval = get(labelIntervalAtom);
      return getAxisLabelValues(bottomValue, topValue, labelInterval);
    });
    const labelValueAndTextsAtom = atom((get) => {
      const labelValues = get(labelValuesAtom);
      const labelInterval = get(labelIntervalAtom);
      return labelValues.map((value) => ({
        value,
        text: formatValue(value, labelInterval),
      }));
    });
    const maxLabelWidthAtom = atom((get) => {
      const labelValueAndTexts = get(labelValueAndTextsAtom);
      return Math.max(
        ...labelValueAndTexts.map(
          ({ text }) => measureText(valueAxisFont, text).width
        )
      );
    });
    bunja.effect(() => {
      onsub();
      return store.sub(maxLabelWidthAtom, onsub);
      function onsub() {
        const maxLabelWidth = store.get(maxLabelWidthAtom);
        store.set(valueAxisWidthSetterAtom, maxLabelWidth);
      }
    });
    return {
      formatValue,
      screenHeightAtom,
      topValueAtom,
      bottomValueAtom,
      labelIntervalAtom,
      labelValuesAtom,
      labelValueAndTextsAtom,
    };
  }
);

function getAxisLabelValues(
  min: number,
  max: number,
  interval: number
): number[] {
  const result = [] as number[];
  const start = Math.floor(min / interval);
  const end = Math.floor(max / interval);
  for (let i = start; i <= end; ++i) result.push(i * interval);
  return result;
}

function getInterval(
  size: number,
  stage: number,
  label: number,
  loose: number
): number {
  const maxLabelCount = stage / (label * loose);
  const minInterval = size / maxLabelCount;
  const scale = Math.pow(10, Math.floor(Math.log10(minInterval)));
  return (findFirstGte(minInterval / scale, [1, 2, 2.5, 4, 5]) || 10) * scale;
  function findFirstGte(x: number, arr: number[]) {
    for (const v of arr) if (v >= x) return v;
  }
}
