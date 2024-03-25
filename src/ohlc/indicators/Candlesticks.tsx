import { useAtomValue } from "jotai";
import { useMolecule } from "bunshi/react";

import { IndicatorMolecule, useDraw } from "../indicator";

export default function Candlesticks() {
  const { chartDataAtom, canvasInfoAtom } = useMolecule(IndicatorMolecule);
  const chartData = useAtomValue(chartDataAtom);
  const canvasInfo = useAtomValue(canvasInfoAtom);
  useDraw((ctx) => {
    const dataArray = Object.values(chartData.raw);
    for (let i = 0; i < dataArray.length; ++i) {
      const data = dataArray[i];
      const y = (Math.min(data.open, data.close) - 40000) / 10;
      const h = Math.max(1, Math.abs(data.close - data.open) / 10);
      ctx.rect(i, y, 1, h);
    }
    ctx.fill();
    console.log({ ctx, chartData, canvasInfo });
  });
  return null;
}
