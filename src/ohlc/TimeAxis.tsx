import React from "react";
import { useAtomValue } from "jotai";
import { molecule } from "bunshi";
import { useMolecule } from "bunshi/react";

import { ColMolecule } from "./Col";

export const TimeAxisMolecule = molecule(() => {
  // TODO
});
export const TimeAxis = React.memo(function TimeAxis() {
  const { chartWidthAtom, valueAxisWidthAtom } = useMolecule(ColMolecule);
  const chartWidth = useAtomValue(chartWidthAtom);
  const valueAxisWidth = useAtomValue(valueAxisWidthAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <canvas
        ref={canvasRef}
        width={chartWidth}
        style={{ flexGrow: 1, height: 20 }}
      />
      <div style={{ flexBasis: `${valueAxisWidth}px` }} />
    </div>
  );
});
