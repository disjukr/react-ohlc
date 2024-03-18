import React from "react";

let id = 0;
export default function useInstanceId() {
  return React.useState(() => id++)[0];
}
