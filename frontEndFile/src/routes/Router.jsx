import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

import Home from "../pages/home";
import Dashboard from "../pages/dashboard";
import Episodes from "../pages/episodes";

import AdminDashboard from "../components/admin/adminDashboard";

const Router = () => {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/episodes" element={<Episodes />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default Router;