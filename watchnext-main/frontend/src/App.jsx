import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import MovieDetails from "./pages/MovieDetails";
import Recommendations from "./pages/Recommendations";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
  const [activeUserId, setActiveUserId] = useState(18);

  return (
    <div className="ott-layout">
      <Navbar
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
      />

      <main className="ott-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/movie/:id"
            element={<MovieDetails activeUserId={activeUserId} />}
          />
          <Route
            path="/recommendations"
            element={
              <Recommendations
                activeUserId={activeUserId}
                onSelectUser={setActiveUserId}
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
