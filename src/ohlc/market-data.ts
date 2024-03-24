import type { PrimitiveAtom } from "jotai";

/**
 * key: symbol key
 */
export type SymbolDataAtoms = Record<string, PrimitiveAtom<SymbolData>>;

export interface SymbolData {
  /**
   * key: interval
   */
  chartDataAtoms: Record<number, PrimitiveAtom<ChartData>>;
}

/**
 * ES2015 이상에서 object key가 전부 양의 정수라면 항목을 순회할 때 정렬돼있을 거란 기대를 할 수 있음.
 * 이 기대를 할 수 없는 환경을 지원해야 한다면 time range query를 저렴하게 할 수 있는 다른 자료구조로 바꿔야 할 것.
 */
export type RawData = Record<number, Data>;

export interface ChartData {
  /**
   * 분봉, 시간봉 등을 표현하기 위한 값. 밀리세컨드 단위.
   */
  interval: number;
  /**
   * key: 밀리초 타임스탬프, value: ohlc 값
   */
  raw: RawData;
  minTimestamp: number;
  maxTimestamp: number;
  /**
   * market data를 마지막으로 갱신한 시점의 `Date.now()`값
   * raw를 매번 새로만들지 않아도 MarketData atom을 구독할 수 있도록 하기위해 사용.
   */
  lastUpdated: number;
}

export function createChartData(interval: number, raw: RawData): ChartData {
  return { interval, raw, ...getTimestampMinMax(raw), lastUpdated: Date.now() };
}

export function updateChartData(old: ChartData, raw: RawData): ChartData {
  const lastUpdated = Date.now();
  const newT = getTimestampMinMax(raw);
  const minTimestamp =
    newT.minTimestamp < old.minTimestamp ? newT.minTimestamp : old.minTimestamp;
  const maxTimestamp =
    newT.maxTimestamp > old.maxTimestamp ? newT.maxTimestamp : old.maxTimestamp;
  return {
    ...old,
    raw: Object.assign(old.raw, raw),
    minTimestamp,
    maxTimestamp,
    lastUpdated,
  };
}

interface TimestampMinMax {
  minTimestamp: number;
  maxTimestamp: number;
}
function getTimestampMinMax(raw: RawData): TimestampMinMax {
  const timestamps = Object.keys(raw).map(Number);
  return {
    minTimestamp: timestamps[0] ?? NaN,
    maxTimestamp: timestamps[timestamps.length - 1] ?? NaN,
  };
}

export class Data {
  constructor(
    public timestamp: number,
    public open: number,
    public high: number,
    public low: number,
    public close: number,
    public volume: number,
    public trades: number
  ) {}
}
