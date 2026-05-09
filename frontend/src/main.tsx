import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { EditorPage } from "./pages/Editor";
import { UploadPage } from "./pages/Upload";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/editor/:jobId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
