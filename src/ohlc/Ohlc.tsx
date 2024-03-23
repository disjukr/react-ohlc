import React from "react";
import { atom, getDefaultStore } from "jotai";
import { createScope, molecule, use } from "bunshi";

import type { RawData, SymbolData, SymbolDataAtoms } from "./market-data";
import type { ColProps } from "./Col";

export const OhlcScope = createScope(undefined);
export const OhlcMolecule = molecule(() => {
  use(OhlcScope);
  const store = getDefaultStore();
  const symbolDataAtomsAtom = atom<SymbolDataAtoms>({});
  function upsertSymbolData(symbolKey: string, interval: number, raw: RawData) {
    const lastUpdated = Date.now();
    const symbolDataAtoms = store.get(symbolDataAtomsAtom);
    const symbolDataAtom = symbolDataAtoms?.[symbolKey];
    if (symbolDataAtom) {
      const symbolData = store.get(symbolDataAtom);
      const chartDataAtom = symbolData?.chartDataAtoms?.[interval];
      if (chartDataAtom) {
        const chartData = store.get(chartDataAtom);
        store.set(chartDataAtom, {
          ...chartData,
          raw: Object.assign(chartData.raw, raw),
          lastUpdated,
        });
      } else {
        store.set(symbolDataAtom, {
          chartDataAtoms: { [interval]: atom({ interval, raw, lastUpdated }) },
        });
      }
    } else {
      store.set(symbolDataAtomsAtom, {
        ...symbolDataAtoms,
        [symbolKey]: atom<SymbolData>({
          chartDataAtoms: { [interval]: atom({ interval, raw, lastUpdated }) },
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
        display: "flex",
        flexDirection: "row",
      }}
    >
      {props.children}
    </div>
  );
}
export default React.memo(Ohlc);
