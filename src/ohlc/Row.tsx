import React from "react";
import { atom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";
import { createScope, molecule, onMount, use } from "bunshi";
import { ScopeProvider, useMolecule } from "bunshi/react";
import useResizeObserver from "@react-hook/resize-observer";

import rafloop from "./misc/rafloop";
import { Layers, Layer } from "./misc/layer";
import { DevicePixelRatioMolecule } from "./misc/devicePixelRatio";
import { ColMolecule } from "./Col";

const RowScope = createScope(undefined);

export const RowMolecule = molecule(() => {
  use(RowScope);
  const { chartDataAtom } = use(ColMolecule);
  const rawDataAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    return chartData?.raw;
  });
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
  interface CanvasInfo {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
  }
  const canvasInfoAtom = atom<CanvasInfo | undefined>(undefined);
  /**
   * focus와 zoom값을 자동으로 결정할지 여부
   */
  const autoAtom = atom(true);
  /**
   * 세로축의 중심이 가져야 할 값
   */
  const focusAtom = atom(0);
  /**
   * 세로축의 단위는 픽셀인데 여기에 얼마를 곱할지
   */
  const zoomAtom = atom(1);
  onMount(() => {
    const { start, stop } = rafloop(() => {
      // TODO
    });
    start();
    return stop;
  });
  return { canvasInfoAtom, autoAtom, focusAtom, zoomAtom };
});

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactElement | React.ReactElement[];
}
function Row(props: RowProps) {
  return (
    <ScopeProvider scope={RowScope} uniqueValue>
      <div
        {...props}
        style={{
          ...props.style,
          flex: "1 0 0",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Layers style={{ flex: "1 1 0" }}>
          <RowCanvasLayer />
          {props.children && <Layer>{props.children}</Layer>}
        </Layers>
        <RowAxis />
      </div>
    </ScopeProvider>
  );
}

export default React.memo(Row);

const RowCanvasLayer = React.memo(function RowCanvasLayer() {
  const { canvasInfoAtom } = useMolecule(RowMolecule);
  const setCanvasInfo = useSetAtom(canvasInfoAtom);
  const devicePixelRatioAtom = useMolecule(DevicePixelRatioMolecule);
  const devicePixelRatio = useAtomValue(devicePixelRatioAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // 처음 한 번은 무조건 불릴 것이라 기대할 수 있음
  // https://drafts.csswg.org/resize-observer/#ref-for-element%E2%91%A3
  // > Observation will fire when observation starts if Element is being rendered, and Element’s size is not 0,0.
  useResizeObserver(canvasRef, ({ contentRect }) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = contentRect.width | 0;
    const height = contentRect.height | 0;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    setCanvasInfo({ canvas, width, height });
  });
  React.useEffect(() => setCanvasInfo(undefined), []);
  return (
    <Layer>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </Layer>
  );
});

const RowAxis = React.memo(function RowAxis() {
  const { rowAxisWidthAtom } = useMolecule(ColMolecule);
  const rowAxisWidth = useAtomValue(rowAxisWidthAtom);
  const flexBasis = `${rowAxisWidth}px`;
  return <div style={{ flexBasis }}>TODO: price axis</div>;
});
