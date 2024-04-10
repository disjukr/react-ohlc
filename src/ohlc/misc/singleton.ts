export interface Singleton<T> {
  get value(): T;
}
export default function singleton<T>(init: () => T): Singleton<T> {
  let v: T;
  return {
    get value() {
      if (v) return v;
      return (v = init());
    },
  };
}
