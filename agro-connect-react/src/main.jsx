import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

/*
 * main.css already @imports variables, components, forms, dashboard,
 * marketplace, ai and responsive — in that order — so importing it alone
 * reproduces the exact cascade the original HTML shells produced.
 */
import "./styles/main.css";
import "./styles/react-adjustments.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
