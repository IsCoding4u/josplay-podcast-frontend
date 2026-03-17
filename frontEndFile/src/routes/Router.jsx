import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

import Home from "../pages/home";
import Dashboard from "../pages/dashboard";
import Episodes from "../pages/episodes";
import Podcasts from "../pages/podcasts";

import AdminDashboard from "../components/admin/adminDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>

      <Header />

      <main style={{ minHeight: "80vh" }}>
        <Routes>

        
          <Route path="/" element={<Home />} />

          <Route path="/podcasts" element={<Podcasts />} />

          <Route
            path="/podcasts/:id/episodes"
            element={<Episodes />}
          />

          <Route path="/dashboard" element={<Dashboard />} />

         
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

        </Routes>
      </main>

      <Footer />

    </BrowserRouter>
  );
}