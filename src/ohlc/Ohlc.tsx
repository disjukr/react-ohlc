import React from "react";
import { atom, getDefaultStore } from "jotai";
import { bunja } from "bunja";

import {
  type RawData,
  type SymbolData,
  type SymbolDataAtoms,
  updateChartData,
  createChartData,
} from "./market-data";
import type { ColProps } from "./col/Col";
import { createScopeFromContext } from "bunja/react";

export type Store = ReturnType<typeof getDefaultStore>;

export const OhlcContext = React.createContext(getDefaultStore());
export const OhlcScope = createScopeFromContext(OhlcContext);
export const ohlcBunja = bunja(() =>{
  const store = bunja.use(OhlcScope);
  const symbolDataAtomsAtom = atom<SymbolDataAtoms>({});
  function upsertSymbolData(symbolKey: string, interval: number, raw: RawData) {
    const symbolDataAtoms = store.get(symbolDataAtomsAtom);
    const symbolDataAtom = symbolDataAtoms?.[symbolKey];
    if (symbolDataAtom) {
      const symbolData = store.get(symbolDataAtom);
      const chartDataAtom = symbolData?.chartDataAtoms?.[interval];
      if (chartDataAtom) {
        const old = store.get(chartDataAtom);
        store.set(chartDataAtom, updateChartData(old, raw));
      } else {
        store.set(symbolDataAtom, {
          chartDataAtoms: { [interval]: atom(createChartData(interval, raw)) },
        });
      }
    } else {
      store.set(symbolDataAtomsAtom, {
        ...symbolDataAtoms,
        [symbolKey]: atom<SymbolData>({
          chartDataAtoms: { [interval]: atom(createChartData(interval, raw)) },
        }),
      });
    }
  }
  return { symbolDataAtomsAtom, upsertSymbolData };
});

export interface OhlcProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<ColProps> | React.ReactElement<ColProps>[];
}
function Ohlc(props: OhlcProps) {
  return (
    <div
      {...props}
      style={{
        ...props.style,
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {props.children}
    </div>
  );
}
export default React.memo(Ohlc);
