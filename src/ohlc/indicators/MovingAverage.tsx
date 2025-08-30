import { useAtomValue } from "jotai";
import { useBunja } from "bunja/react";

import { useScreenCanvas } from "../row/state";
import { indicatorBunja } from "../indicator";

export interface MovingAverageProps {
  length: number;
  color: string;
}
export default function MovingAverage({ length, color }: MovingAverageProps) {
  const {
    interval,
    chartDataAtom,
    toScreenXAtom,
    toScreenYAtom,
    minScreenTimestampAtom,
    maxScreenTimestampAtom,
  } = useBunja(indicatorBunja);
  const chartData = useAtomValue(chartDataAtom);
  const toScreenX = useAtomValue(toScreenXAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  const minScreenTimestamp = useAtomValue(minScreenTimestampAtom);
  const maxScreenTimestamp = useAtomValue(maxScreenTimestampAtom);
  useScreenCanvas((ctx) => {
    const start = Math.round(minScreenTimestamp / interval) - 1;
    const end = Math.round(maxScreenTimestamp / interval) + 1;
    ctx.strokeStyle = color;
    ctx.beginPath();
    let started = false;
    for (let i = start; i < end; ++i) {
      let sum = 0;
      let cnt = 0;
      for (let j = 0; j < length; ++j) {
        const timestamp = (i - j) * interval;
        const data = chartData.raw[timestamp];
        if (!data) continue;
        sum += data.close;
        ++cnt;
      }
      if (cnt < 1) continue;
      const avg = sum / cnt;
      const timestamp = i * interval;
      const x = toScreenX(timestamp);
      const y = toScreenY(avg);
      if (started) {
        ctx.lineTo(x, y);
      } else {
        started = true;
        ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  });
  return null;
}
