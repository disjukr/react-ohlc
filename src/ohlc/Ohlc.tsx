import React from "react";
import { createScope, molecule, use } from "bunshi";

import type { SymbolDataAtoms } from "./market-data";
import type { ColProps } from "./Col";

export const OhlcScope = createScope(undefined);
export const OhlcMolecule = molecule(() => {
  use(OhlcScope);
  const symbolDataAtoms: SymbolDataAtoms = {};
  return { symbolDataAtoms };
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
