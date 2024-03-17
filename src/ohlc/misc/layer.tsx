import React from "react";

export interface LayersProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Layers = React.memo(function Layer(props: LayersProps) {
  return <div {...props} style={{ ...props.style, position: "relative" }} />;
});

export interface LayerProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Layer = React.memo(function Layer(props: LayerProps) {
  return (
    <div
      {...props}
      style={{
        ...props.style,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
});
