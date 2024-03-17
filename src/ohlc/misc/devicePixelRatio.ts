import { atom } from "jotai";
import { molecule } from "bunshi";

export const DevicePixelRatioMolecule = molecule(() => {
  const devicePixelRatioAtom = atom(globalThis.devicePixelRatio || 1);
  // TODO: 변화 감지해서 업데이트
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
  return devicePixelRatioAtom;
});
