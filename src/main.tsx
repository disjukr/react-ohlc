import React from "react";
import ReactDOM from "react-dom/client";
import { useMolecule } from "bunshi/react";

import Ohlc, { OhlcMolecule } from "./ohlc/Ohlc";
import Col from "./ohlc/Col";
import Row from "./ohlc/Row";
import Candlesticks from "./ohlc/indicators/Candlesticks";
import MovingAverage from "./ohlc/indicators/MovingAverage";
import mockdata from "./mockdata";

function App() {
  const { upsertSymbolData } = useMolecule(OhlcMolecule);
  React.useEffect(() => upsertSymbolData("mock", 60000, mockdata), []);
  return (
    <Ohlc style={{ height: "500px", border: "1px solid black" }}>
      <Col symbolKey="mock" interval={60000}>
        <Row>
          <Candlesticks risingColor="green" fallingColor="red" />
          <MovingAverage length={9} color="blue" />
        </Row>
      </Col>
    </Ohlc>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
