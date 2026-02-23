import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./api/store.js";
import {ToastProvider } from "./reusableComponents/Toasts/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider position="top-right">
          <App />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
