import { useAtomValue } from "jotai";
import { useMolecule } from "bunshi/react";

import { IndicatorMolecule, useDraw } from "../indicator";

export default function Candlesticks() {
  const { chartDataAtom, dataWidthAtom, toScreenXAtom, toScreenYAtom } =
    useMolecule(IndicatorMolecule);
  const chartData = useAtomValue(chartDataAtom);
  const dataWidth = useAtomValue(dataWidthAtom);
  const toScreenX = useAtomValue(toScreenXAtom);
  const toScreenY = useAtomValue(toScreenYAtom);
  useDraw((ctx) => {
    const dataArray = Object.values(chartData.raw);
    for (let i = 0; i < dataArray.length; ++i) {
      const data = dataArray[i];
      const openY = toScreenY(data.open);
      const highY = toScreenY(data.high);
      const lowY = toScreenY(data.low);
      const closeY = toScreenY(data.close);
      const x = toScreenX(data.timestamp);
      const y1 = Math.min(highY, lowY);
      const h1 = Math.max(1, Math.abs(lowY - highY));
      const y2 = Math.min(openY, closeY);
      const h2 = Math.max(1, Math.abs(closeY - openY));
      const gap = dataWidth / 4;
      const halfWidth = (dataWidth - gap) / 2;
      ctx.fillStyle = data.open < data.close ? "green" : "red";
      ctx.beginPath();
      ctx.rect((x + gap + halfWidth - 0.5) | 0, y1, 1, h1);
      ctx.rect((x + gap) | 0, y2, (dataWidth - gap) | 0, h2);
      ctx.fill();
    }
  });
  return null;
}
