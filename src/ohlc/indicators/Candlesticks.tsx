import { useMolecule } from "bunshi/react";

import { IndicatorMolecule, useDraw } from "../indicator";

export default function Candlesticks() {
  useMolecule(IndicatorMolecule);
  useDraw((ctx) => {
    // TODO
    console.log({ ctx });
  });
  return null;
}
