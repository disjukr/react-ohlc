import React from "react";
import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { molecule, onMount, use } from "bunshi";
import { useMolecule } from "bunshi/react";

import { useSetCanvasInfo } from "./misc/canvas";
import measureText from "./misc/measureText";
import { ColMolecule } from "./Col";
import { RowMolecule } from "./Row";
import { IndicatorMolecule, useValueAxisCanvas } from "./indicator";

const valueAxisFontSize = 10;
const valueAxisFont = `${valueAxisFontSize} sans-serif`;

export const ValueAxisMolecule = molecule(() => {
  const { valueAxisWidthSetterAtom } = use(ColMolecule);
  const { toValueAtom, screenCanvasInfoAtom } = use(IndicatorMolecule);
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
  const maxLabelWidthAtom = atom((get) => {
    const labelValues = get(labelValuesAtom);
    return Math.max(
      ...labelValues.map(
        (value) => measureText(valueAxisFont, String(value)).width
      )
    );
  });
  onMount(() => {
    const store = getDefaultStore();
    onsub();
    return store.sub(maxLabelWidthAtom, onsub);
    function onsub() {
      const maxLabelWidth = store.get(maxLabelWidthAtom);
      store.set(valueAxisWidthSetterAtom, maxLabelWidth);
    }
  });
  return {
    screenHeightAtom,
    topValueAtom,
    bottomValueAtom,
    labelIntervalAtom,
    labelValuesAtom,
  };
});

export const ValueAxis = React.memo(function ValueAxis() {
  const { readyToDrawAtom } = useMolecule(RowMolecule);
  const readyToDraw = useAtomValue(readyToDrawAtom);
  if (!readyToDraw) return null;
  return <ValueAxisInternal />;
});

const ValueAxisInternal = function ValueAxisInternal() {
  const { valueAxisWidthAtom } = useMolecule(ColMolecule);
  const { valueAxisCanvasInfoAtom } = useMolecule(RowMolecule);
  const { screenCanvasInfoAtom } = useMolecule(IndicatorMolecule);
  const width = useAtomValue(valueAxisWidthAtom);
  const { height } = useAtomValue(screenCanvasInfoAtom);
  const setCanvasInfo = useSetAtom(valueAxisCanvasInfoAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useSetCanvasInfo({ setCanvasInfo, canvasRef });
  return <canvas ref={canvasRef} style={{ width, height }} />;
};

export function ValueAxisContent() {
  const { labelValuesAtom } = useMolecule(ValueAxisMolecule);
  const { toScreenYAtom } = useMolecule(IndicatorMolecule);
  const labelValues = useAtomValue(labelValuesAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  useValueAxisCanvas((ctx) => {
    ctx.font = valueAxisFont;
    for (const labelValue of labelValues) {
      const y = toScreenY(labelValue);
      ctx.fillText(String(labelValue), 0, y);
    }
  });
  return null;
}

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
