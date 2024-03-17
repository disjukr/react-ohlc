import React from "react";
import ReactDOM from "react-dom/client";

import Ohlc from "./ohlc/Ohlc";
import Col from "./ohlc/Col";
import Row from "./ohlc/Row";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Ohlc style={{ height: "500px", border: "1px solid black" }}>
      <Col>
        <Row />
      </Col>
    </Ohlc>
  </React.StrictMode>
);
