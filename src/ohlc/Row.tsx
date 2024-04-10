import React from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { createScope, molecule, onUnmount, use } from "bunshi";
import { ScopeProvider, useMolecule } from "bunshi/react";

import { lerp } from "./misc/interpolation";
import { Layers, Layer } from "./misc/layer";
import {
  createCanvasFns,
  type CanvasInfo,
  useSetCanvasInfo,
} from "./misc/canvas";
import { DevicePixelRatioMolecule } from "./misc/devicePixelRatio";
import type { Data } from "./market-data";
import { ColMolecule } from "./Col";
import { ValueAxis, ValueAxisContent } from "./ValueAxis";
import { DrawOrderContext } from "./indicator";

const RowScope = createScope(undefined);

export const RowMolecule = molecule(() => {
  use(RowScope);
  const devicePixelRatioAtom = use(DevicePixelRatioMolecule);
  const {
    interval,
    chartDataAtom,
    offsetAtom: colOffsetAtom,
    zoomAtom: colZoomAtom,
  } = use(ColMolecule);
  const readyToDrawAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    const screenCanvasInfo = get(screenCanvasInfoAtom);
    return Boolean(chartData && screenCanvasInfo);
  });
  const screenCanvasInfoAtom = atom<CanvasInfo | undefined>(undefined);
  const valueAxisCanvasInfoAtom = atom<CanvasInfo | undefined>(undefined);
  const {
    clearDrawFns: clearScreenDrawFns,
    updateDrawFn: updateScreenDrawFn,
    dispose: disposeScreenCanvasFns,
  } = createCanvasFns({
    canvasInfoAtom: screenCanvasInfoAtom,
    devicePixelRatioAtom,
  });
  const {
    clearDrawFns: clearValueAxisDrawFns,
    updateDrawFn: updateValueAxisDrawFn,
    dispose: disposeValueAxisCanvasFns,
  } = createCanvasFns({
    canvasInfoAtom: valueAxisCanvasInfoAtom,
    devicePixelRatioAtom,
  });
  onUnmount(() => {
    disposeScreenCanvasFns();
    disposeValueAxisCanvasFns();
  });
  /**
   * focus와 zoom값을 자료와 화면에 맞춰 자동으로 결정할지 여부
   */
  const autoAtom = atom(true);
  /**
   * 세로축의 중심이 가져야 할 값
   */
  const focusAtom = atom((get) => {
    const auto = get(autoAtom);
    const focusSource = get(focusSourceAtom);
    const minScreenValue = get(minScreenValueAtom);
    const maxScreenValue = get(maxScreenValueAtom);
    if (!auto) return focusSource;
    return lerp(maxScreenValue, minScreenValue, 0.5);
  });
  const focusSourceAtom = atom(0);
  /**
   * 세로축의 단위는 픽셀인데 여기에 얼마를 곱할지
   */
  const zoomAtom = atom((get) => {
    const auto = get(autoAtom);
    const screenCanvasInfo = get(screenCanvasInfoAtom);
    const zoomSource = get(zoomSourceAtom);
    const minScreenValue = get(minScreenValueAtom);
    const maxScreenValue = get(maxScreenValueAtom);
    if (!auto || !screenCanvasInfo) return zoomSource;
    const { height: canvasHeight } = screenCanvasInfo;
    const dataHeight = maxScreenValue - minScreenValue;
    return (canvasHeight * 0.6) / dataHeight;
  });
  const zoomSourceAtom = atom(1);
  const minScreenValueAtom = atom((get) => {
    const reduceInnerData = get(reduceInnerDataAtom);
    return reduceInnerData(
      (prev, { low }) => (prev < low ? prev : low),
      Infinity
    );
  });
  const maxScreenValueAtom = atom((get) => {
    const reduceInnerData = get(reduceInnerDataAtom);
    return reduceInnerData(
      (prev, { high }) => (prev > high ? prev : high),
      -Infinity
    );
  });
  const toTimestampAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    const screenCanvasInfo = get(screenCanvasInfoAtom);
    const offset = get(colOffsetAtom);
    const zoom = get(colZoomAtom);
    return function toTimestamp(screenX: number): number {
      const maxTimestamp = chartData?.maxTimestamp || 0;
      const width = screenCanvasInfo?.width || 0;
      return maxTimestamp + offset - (screenX - width) / -zoom;
    };
  });
  const minScreenTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    return Math.ceil(toTimestamp(0) / interval) * interval;
  });
  const maxScreenTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    const screenCanvasInfo = get(screenCanvasInfoAtom);
    const width = screenCanvasInfo?.width || 0;
    return Math.ceil(toTimestamp(width) / interval) * interval;
  });
  const reduceInnerDataAtom = atom((get) => {
    const chartData = get(chartDataAtom);
    const minScreenTimestamp = get(minScreenTimestampAtom);
    const maxScreenTimestamp = get(maxScreenTimestampAtom);
    const start = Math.round(minScreenTimestamp / interval);
    const end = Math.round(maxScreenTimestamp / interval);
    return function reduceInnerData<T>(
      fn: (prev: T, curr: Data) => T,
      initial: T
    ): T {
      let acc = initial;
      if (!chartData) return acc;
      for (let i = start; i < end; ++i) {
        const timestamp = i * interval;
        const data = chartData.raw[timestamp];
        if (!data) continue;
        acc = fn(acc, data);
      }
      return acc;
    };
  });
  return {
    readyToDrawAtom,
    autoAtom,
    focusAtom,
    focusSourceAtom,
    zoomAtom,
    zoomSourceAtom,
    toTimestampAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
    screenCanvasInfoAtom,
    valueAxisCanvasInfoAtom,
    clearScreenDrawFns,
    updateScreenDrawFn,
    clearValueAxisDrawFns,
    updateValueAxisDrawFn,
  };
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
          justifyContent: "stretch",
        }}
      >
        <RowLayers>
          <ValueAxisContent />
          {props.children as React.ReactElement}
        </RowLayers>
        <ValueAxis />
      </div>
    </ScopeProvider>
  );
}

export default React.memo(Row);

interface RowLayersProps {
  children?: React.ReactElement | React.ReactElement[];
}
function RowLayers({ children }: RowLayersProps) {
  const { readyToDrawAtom, clearScreenDrawFns, clearValueAxisDrawFns } =
    useMolecule(RowMolecule);
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
  const { screenCanvasInfoAtom } = useMolecule(RowMolecule);
  const setCanvasInfo = useSetAtom(screenCanvasInfoAtom);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useSetCanvasInfo({ setCanvasInfo, canvasRef });
  return (
    <Layer>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </Layer>
  );
});
