import React from "react";

let id = 0;
export default function useId() {
  return React.useState(() => id++)[0];
}
