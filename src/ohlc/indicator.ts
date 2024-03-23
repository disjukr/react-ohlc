import React from "react";
import { atom } from "jotai";
import { molecule, use } from "bunshi";
import { useMolecule } from "bunshi/react";

import { RowMolecule } from "./Row";

export const DrawOrderContext = React.createContext(0);

export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export function useDraw(fn: DrawFn) {
  const { updateDrawFn } = useMolecule(RowMolecule);
  const drawOrder = React.useContext(DrawOrderContext);
  React.useLayoutEffect(() => updateDrawFn(drawOrder, fn));
}

export const IndicatorMolecule = molecule(() => {
  const { rawDataAtom } = use(RowMolecule);
  const timestampsAtom = atom((get) => {
    const rawData = get(rawDataAtom);
    if (!rawData) return [];
    return Object.keys(rawData).map(Number);
  });
  const minTimestampAtom = atom((get) => {
    const timestamps = get(timestampsAtom);
    return timestamps[0] ?? -Infinity;
  });
  const maxTimestampAtom = atom((get) => {
    const timestamps = get(timestampsAtom);
    return timestamps[timestamps.length - 1] ?? Infinity;
  });
  return {
    timestampsAtom,
    minTimestampAtom,
    maxTimestampAtom,
  };
});
