import type React from "react";
import { atom } from "jotai";
import { createScope, molecule, use } from "bunshi";

import type { ColProps } from "./Col";

export const OhlcScope = createScope(undefined);
export const OhlcMolecule = molecule(() => {
  use(OhlcScope);
  const anAtom = atom<number>(0);
  return { anAtom };
});

export interface OhlcProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<ColProps> | React.ReactElement<ColProps>[];
}
export default function Ohlc(props: OhlcProps) {
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
