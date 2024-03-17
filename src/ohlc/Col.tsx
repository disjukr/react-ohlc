import React from "react";
import { atom } from "jotai";
import { createScope, molecule, use } from "bunshi";
import { ScopeProvider, useMolecule } from "bunshi/react";

import type { RowProps } from "./Row";
import { useAtomValue } from "jotai/react";

export const ColScope = createScope(undefined);

export const ColMolecule = molecule(() => {
  use(ColScope);
  /**
   * 가로축의 가장 오른쪽은 최신 데이터의 시각이 되도록 할 건데 여기서 얼마나 조정해서 볼지.
   * 단위는 밀리초.
   */
  const offsetAtom = atom(0);
  /**
   * 가로축 기본 단위는 밀리초/픽셀 인데 여기에 얼마를 곱해서 볼건지.
   */
  const zoomAtom = atom(1);
  /**
   * 같은 Col 안의 모든 Row는 축 정보 영역의 가로폭 크기를 똑같이 가져가야 하기 때문에 가로폭 상태를 Col에서 관리함.
   */
  const rowAxisWidthAtom = atom(1);
  return { offsetAtom, zoomAtom, rowAxisWidthAtom };
});

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<RowProps> | React.ReactElement<RowProps>[];
}
function Col(props: ColProps) {
  return (
    <ScopeProvider scope={ColScope} uniqueValue>
      <div
        {...props}
        style={{
          ...props.style,
          flex: "1 0 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: "1 0 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {props.children}
        </div>
        <ColAxis />
      </div>
    </ScopeProvider>
  );
}

export default React.memo(Col);

const ColAxis = React.memo(function ColAxis() {
  const { rowAxisWidthAtom } = useMolecule(ColMolecule);
  const rowAxisWidth = useAtomValue(rowAxisWidthAtom);
  const width = `${rowAxisWidth}px`;
  return <div style={{ width }}>TODO: time axis</div>;
});
