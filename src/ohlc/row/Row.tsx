import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useBunja } from "bunja/react";

import useId from "../misc/useId";
import { Layers, Layer } from "../misc/layer";
import { useSetCanvasInfo } from "../misc/canvas";
import { ValueAxisContext } from "./value-axis/state";
import { ValueAxis, ValueAxisContent } from "./value-axis/ValueAxis";
import { DrawOrderContext, RowContext, rowBunja } from "./state";

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  formatValue?: (value: number, interval: number) => string;
  children?: React.ReactElement | React.ReactElement[];
}
function Row({ formatValue = String, children, ...props }: RowProps) {
  const id = useId();
  return (
    <RowContext.Provider value={id}>
      <div
        {...props}
        style={{
          ...props.style,
          flex: "1 0 0",
          display: "flex",
          flexDirection: "row",
          justifyContent: "stretch",
        }}
      >
        <RowLayers>
          <ValueAxisContext.Provider value={formatValue}>
            <ValueAxisContent />
          </ValueAxisContext.Provider>
          {children as React.ReactElement}
        </RowLayers>
        <ValueAxis />
      </div>
    </RowContext.Provider>
  );
}

export default React.memo(Row);

interface RowLayersProps {
  children?: React.ReactElement | React.ReactElement[];
}
function RowLayers({ children }: RowLayersProps) {
  const { readyToDrawAtom, clearScreenDrawFns, clearValueAxisDrawFns } =
    useBunja(rowBunja);
  const readyToDraw = useAtomValue(readyToDrawAtom);
  React.useLayoutEffect(clearScreenDrawFns);
  React.useLayoutEffect(clearValueAxisDrawFns);
  return (
    <Layers style={{ flex: "1 1 0" }}>
      <RowCanvasLayer />
      {readyToDraw && (
        <Layer>
          {React.Children.map(children, (child, index) => (
            <DrawOrderContext.Provider value={index}>
              {child}
            </DrawOrderContext.Provider>
          ))}
        </Layer>
      )}
    </Layers>
  );
}

const RowCanvasLayer = React.memo(function RowCanvasLayer() {
  const { screenCanvasInfoAtom } = useBunja(rowBunja);
  const setCanvasInfo = useSetAtom(screenCanvasInfoAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useSetCanvasInfo({ setCanvasInfo, canvasRef });
  return (
    <Layer>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </Layer>
  );
});
