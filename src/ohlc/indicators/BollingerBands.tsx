import { useAtomValue } from "jotai";
import { useBunja } from "bunja/react";

import { useScreenCanvas } from "../row/state";
import { indicatorBunja } from "../indicator";

export interface BollingerBandsProps {
  length: number;
  multiplier: number;
  meanColor: string;
  upperColor: string;
  lowerColor: string;
  backgroundColor: string;
}
export default function BollingerBands({
  length,
  multiplier,
  meanColor,
  upperColor,
  lowerColor,
  backgroundColor,
}: BollingerBandsProps) {
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
    const bbs: BB[] = [];
    for (let i = start; i < end; ++i) {
      let sum = 0;
      let sum2 = 0;
      let cnt = 0;
      for (let j = 0; j < length; ++j) {
        const timestamp = (i - j) * interval;
        const data = chartData.raw[timestamp];
        if (!data) continue;
        sum += data.close;
        sum2 += data.close * data.close;
        ++cnt;
      }
      if (cnt < 1) continue;
      const avg = sum / cnt;
      const timestamp = i * interval;
      const x = toScreenX(timestamp);
      const stddev = Math.sqrt(sum2 / cnt - avg * avg);
      bbs.push(new BB(x, avg, stddev));
    }
    if (bbs.length < 2) return;
    const rbbs = bbs.slice(0).reverse();
    drawBackground: {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      let started = false;
      for (const { x, avg, stddev } of bbs) {
        const y = toScreenY(avg + stddev * multiplier);
        if (started) {
          ctx.lineTo(x, y);
        } else {
          started = true;
          ctx.moveTo(x, y);
        }
      }
      for (const { x, avg, stddev } of rbbs) {
        const y = toScreenY(avg - stddev * multiplier);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawUpper: {
      ctx.strokeStyle = upperColor;
      ctx.beginPath();
      let started = false;
      for (const { x, avg, stddev } of bbs) {
        const y = toScreenY(avg + stddev * multiplier);
        if (started) {
          ctx.lineTo(x, y);
        } else {
          started = true;
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }
    drawLower: {
      ctx.strokeStyle = lowerColor;
      ctx.beginPath();
      let started = false;
      for (const { x, avg, stddev } of bbs) {
        const y = toScreenY(avg - stddev * multiplier);
        if (started) {
          ctx.lineTo(x, y);
        } else {
          started = true;
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }
    drawMean: {
      ctx.strokeStyle = meanColor;
      ctx.beginPath();
      let started = false;
      for (const { x, avg } of bbs) {
        const y = toScreenY(avg);
        if (started) {
          ctx.lineTo(x, y);
        } else {
          started = true;
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }
  });
  return null;
}

class BB {
  constructor(public x: number, public avg: number, public stddev: number) {}
}
