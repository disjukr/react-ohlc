import { useAtomValue } from "jotai";
import { useBunja } from "bunja/react";

import { useScreenCanvas } from "../row/state";
import { indicatorBunja } from "../indicator";

export interface CandlesticksProps {
  risingColor: string;
  fallingColor: string;
}
export default function Candlesticks({
  risingColor,
  fallingColor,
}: CandlesticksProps) {
  const {
    interval,
    chartDataAtom,
    dataWidthAtom,
    toScreenXAtom,
    toScreenYAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  } = useBunja(indicatorBunja);
  const chartData = useAtomValue(chartDataAtom);
  const dataWidth = useAtomValue(dataWidthAtom);
  const toScreenX = useAtomValue(toScreenXAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  const minScreenTimestamp = useAtomValue(minScreenTimestampAtom);
  const maxScreenTimestamp = useAtomValue(maxScreenTimestampAtom);
  useScreenCanvas((ctx) => {
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
      const y1 = Math.round(Math.min(highY, lowY));
      const h1 = Math.round(Math.abs(lowY - highY));
      const y2 = Math.round(Math.min(openY, closeY));
      const h2 = Math.max(1, Math.round(Math.abs(closeY - openY)));
      const gap = dataWidth / 4;
      const halfWidth = (dataWidth - gap) / 2;
      ctx.fillStyle = data.open < data.close ? risingColor : fallingColor;
      ctx.beginPath();
      ctx.rect((x - 0.5) | 0, y1, 1, h1);
      ctx.rect((x - halfWidth) | 0, y2, (dataWidth - gap) | 0, h2);
      ctx.fill();
    }
  });
  return null;
}
