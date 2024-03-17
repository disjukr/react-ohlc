import type { Atom, PrimitiveAtom } from "jotai";

/**
 * key: symbol key
 */
export type SymbolDataAtoms = Record<string, PrimitiveAtom<SymbolData>>;

export interface SymbolData {
  /**
   * key: interval
   */
  chartDataAtoms: Record<number, Atom<ChartData>>;
}

export interface ChartData {
  /**
   * 분봉, 시간봉 등을 표현하기 위한 값. 밀리세컨드 단위.
   */
  interval: number;
  /**
   * key: 밀리초 타임스탬프, value: ohlc 값
   * TODO: time range query를 저렴하게 할 수 있는 자료구조로 바꾸기
   */
  raw: Record<number, Data>;
  /**
   * market data를 마지막으로 갱신한 시점의 `Date.now()`값
   * raw를 매번 새로만들지 않아도 MarketData atom을 구독할 수 있도록 하기위해 사용.
   */
  lastUpdated: number;
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
