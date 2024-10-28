import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConfigPage from "./pages/ConfigPage";
import ChatPage from "./pages/ChatPage";
import Home from "./pages/Home";
import APP_CONFIG from "./config/appConfig";

function App() {
  useEffect(() => {
    // Set document title
    document.title = APP_CONFIG.ASSISTANT_NAME;
    
    // Set favicon
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = APP_CONFIG.FAVICON_PATH;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<ConfigPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
