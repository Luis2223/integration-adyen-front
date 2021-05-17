import React, { useState } from "react";
import DropIn from "./DropIn";
import "@adyen/adyen-web/dist/adyen.css";
import "./App.css";

// A custom hook that builds on useLocation to parse
// the query string for you.

function App({ params }) {

  return (
    <div className="payment-wrapper">
      <DropIn setResultCode={'TESTE'} />
    </div>
  );
}

export default App;