import { atom } from "jotai";
import { bunja } from "bunja";

import { colBunja } from "../state";

export const timeAxisHeight = 20;

export const TimeAxisBunja = bunja(() => {
  const { chartWidthAtom, toTimestampAtom } = bunja.use(colBunja);
  const timeAxisWidthAtom = atom((get) => {
    const chartWidth = get(chartWidthAtom);
    return chartWidth || 0;
  });
  const leftTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    return toTimestamp(0);
  });
  const rightTimestampAtom = atom((get) => {
    const toTimestamp = get(toTimestampAtom);
    const timeAxisWidth = get(timeAxisWidthAtom);
    return toTimestamp(timeAxisWidth);
  });
  return {
    timeAxisWidthAtom,
    leftTimestampAtom,
    rightTimestampAtom,
  };
});
