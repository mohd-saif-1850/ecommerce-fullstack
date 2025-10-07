import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
        withCredentials: true, // Important: sends cookies
      });
      setUser(res.data.data || res.data.user);
    } catch {
      setUser(null); // Not logged in
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for login/logout events
    const handleAuthChange = () => fetchUser();
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="bg-gray-800 text-white flex justify-between p-4">
      <div className="font-bold cursor-pointer" onClick={() => navigate("/")}>
        MS ECOMMERCE
      </div>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span>Hi, {user.username || user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-cyan-500 px-3 py-1 rounded hover:bg-cyan-600"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
