import { Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import ItemPage from "./pages/Items";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items/:id" element={<ItemPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

      </Routes>
    </div>
  );
}

export default App;
