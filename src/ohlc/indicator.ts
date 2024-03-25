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
  const { chartDataAtom: colChartDataAtom } = use(ColMolecule);
  const { canvasInfoAtom: rowCanvasInfoAtom } = use(RowMolecule);
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
  return {
    chartDataAtom,
    canvasInfoAtom,
  };
});
