import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ListingDetail from "./pages/ListingDetail";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<p>Home coming next</p>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<p className="center">Page not found</p>} />
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} /> 
        </Routes>
      </main>
    </>
  );
}