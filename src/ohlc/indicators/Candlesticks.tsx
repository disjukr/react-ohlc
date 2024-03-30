import { useAtomValue } from "jotai";
import { useMolecule } from "bunshi/react";

import { IndicatorMolecule, useDraw } from "../indicator";

export default function Candlesticks() {
  const {
    interval,
    chartDataAtom,
    dataWidthAtom,
    toScreenXAtom,
    toScreenYAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  } = useMolecule(IndicatorMolecule);
  const chartData = useAtomValue(chartDataAtom);
  const dataWidth = useAtomValue(dataWidthAtom);
  const toScreenX = useAtomValue(toScreenXAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  const minScreenTimestamp = useAtomValue(minScreenTimestampAtom);
  const maxScreenTimestamp = useAtomValue(maxScreenTimestampAtom);
  useDraw((ctx) => {
    const start = Math.round(minScreenTimestamp / interval) - 1;
    const end = Math.round(maxScreenTimestamp / interval) + 1;
    for (let i = start; i < end; ++i) {
      const timestamp = i * interval;
      const data = chartData.raw[timestamp];
      if (!data) continue;
      const openY = toScreenY(data.open);
      const highY = toScreenY(data.high);
      const lowY = toScreenY(data.low);
      const closeY = toScreenY(data.close);
      const x = toScreenX(data.timestamp);
      const y1 = Math.min(highY, lowY) | 0;
      const h1 = Math.abs(lowY - highY) | 0;
      const y2 = Math.min(openY, closeY) | 0;
      const h2 = Math.max(1, Math.abs(closeY - openY) | 0);
      const gap = dataWidth / 4;
      const halfWidth = (dataWidth - gap) / 2;
      ctx.fillStyle = data.open < data.close ? "green" : "red";
      ctx.beginPath();
      ctx.rect((x - 0.5) | 0, y1, 1, h1);
      ctx.rect((x - halfWidth) | 0, y2, (dataWidth - gap) | 0, h2);
      ctx.fill();
    }
  });
  return null;
}
