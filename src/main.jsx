import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AuthCallback from "./pages/AuthCallback";
import ResultAccessPage from "./pages/ResultAccessPage";
import AboutUsPage from "./pages/AboutUsPage";
import CampusPage from "./pages/CampusPage";
import SIUPortalPage from "./pages/SIUPortalPage";
import GenerativeArtPage from "./pages/GenerativeArtPage";
import { BackgroundAudioProvider } from "./context/BackgroundAudioContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BackgroundAudioProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/siu-portal" element={<SIUPortalPage />} />
        <Route path="/generative-art" element={<GenerativeArtPage />} />
        <Route path="/callback" element={<AuthCallback />} />
        <Route path="/result-access" element={<ResultAccessPage />} />
        <Route path="/student" element={<ResultAccessPage />} />
        <Route path="/admin" element={<ResultAccessPage />} />
      </Routes>
    </HashRouter>
  </BackgroundAudioProvider>,
);
