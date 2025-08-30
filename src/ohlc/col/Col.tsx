import React from "react";
import { flushSync } from "react-dom";
import { useSetAtom } from "jotai";
import { useBunja } from "bunja/react";
import useResizeObserver from "@react-hook/resize-observer";

import type { RowProps } from "../row/Row";
import { TimeAxis } from "./time-axis/TimeAxis";
import { colBunja, IntervalContext, SymbolKeyContext } from "./state";

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<RowProps> | React.ReactElement<RowProps>[];
  symbolKey: string;
  interval: number;
}
function Col({ symbolKey, interval, ...props }: ColProps) {
  return (
    <SymbolKeyContext.Provider value={symbolKey}>
      <IntervalContext.Provider value={interval}>
        <ColInternal {...props} />
      </IntervalContext.Provider>
    </SymbolKeyContext.Provider>
  );
}

export default React.memo(Col);

function ColInternal(props: React.HTMLAttributes<HTMLDivElement>) {
  const colDivRef = React.useRef<HTMLDivElement>(null);
  const { colWidthAtom } = useBunja(colBunja);
  const setColWidth = useSetAtom(colWidthAtom);
  useResizeObserver(colDivRef, ({ contentRect: { width } }) => {
    flushSync(() => setColWidth(width));
  });
  return (
    <div
      {...props}
      ref={colDivRef}
      style={{
        ...props.style,
        flex: "1 0 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: "1 0 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {props.children}
      </div>
      <TimeAxis />
    </div>
  );
}
