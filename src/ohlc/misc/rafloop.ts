export interface Rafloop {
  start(): void;
  stop(): void;
}

export default function rafloop(callback: FrameRequestCallback): Rafloop {
  let id: null | number = null;
  function loopfn(time: number) {
    if (id != null) return;
    id = requestAnimationFrame(loopfn);
    callback(time);
  }
  return {
    start() {
      if (id != null) return;
      id = requestAnimationFrame(loopfn);
    },
    stop() {
      if (id != null) cancelAnimationFrame(id);
      id = null;
    },
  };
}
