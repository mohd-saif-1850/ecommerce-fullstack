import { useState, useEffect, useCallback } from "react";
import { Menu, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Axios instance with credentials
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Toast notification component
const Toast = ({ notification, className = "" }) => {
  if (!notification) return null;
  const base =
    "absolute top-full left-0 mt-2 z-50 px-3 py-2 rounded-md shadow-lg text-sm whitespace-nowrap";
  const style =
    notification.type === "success"
      ? "bg-green-600 text-white"
      : notification.type === "error"
      ? "bg-red-600 text-white"
      : "bg-gray-800 text-white";

  return (
    <div
      className={`${base} ${style} ${className}`}
      role="status"
      aria-live="polite"
    >
      {notification.message}
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState(null);
  const [notifTimer, setNotifTimer] = useState(null);

  // Show notification
  const showNotification = (notif) => {
    if (notifTimer) {
      clearTimeout(notifTimer);
      setNotifTimer(null);
    }

    setNotification(notif);

    const t = setTimeout(() => {
      setNotification(null);
      setNotifTimer(null);
    }, 5000);
    setNotifTimer(t);
  };

  // Fetch user from backend
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/users/get-user");
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      } else {
        setUser(null); // only set to null if explicitly logged out on backend
      }
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const onAuthChanged = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        setUser(stored || null);
      } catch {
        setUser(null);
      }

      // Show notification if stored
      const raw = localStorage.getItem("auth-notification");
      if (raw) {
        try {
          const notif = JSON.parse(raw);
          if (notif?.message) {
            showNotification(notif);
          }
        } catch {}
        localStorage.removeItem("auth-notification");
      }
    };

    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", (e) => {
      if (e.key === "auth-ts" || e.key === "auth-notification") {
        onAuthChanged();
      }
    });

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      if (notifTimer) clearTimeout(notifTimer);
    };
  }, [fetchUser, notifTimer]);

  // Logout
  const handleLogout = async () => {
    try {
      await api.post("/users/logout-user");
    } catch (err) {
      console.error("Logout failed", err);
    }

    setUser(null);
    localStorage.removeItem("user");

    const notif = {
      message: "Logged out successfully",
      type: "success",
      ts: Date.now(),
    };
    showNotification(notif);
    localStorage.setItem("auth-notification", JSON.stringify(notif));
    localStorage.setItem("auth-ts", notif.ts.toString());
    window.dispatchEvent(new Event("authChanged"));

    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  // Search items
  useEffect(() => {
    if (!query) return setResults([]);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/admin/search-items", {
          params: { query: query.trim() },
        });
        setResults(res.data.items || []);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    navigate(`/items/${item._id}`);
    setMobileSearchOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && results.length > 0) handleSelect(results[0]);
  };

  return (
    <nav className="w-full px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50 bg-black/80">
      <div
        className="text-2xl font-bold text-cyan-400 cursor-pointer"
        onClick={() => navigate("/")}
      >
        MS ECOMMERCE
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search items..."
            className="w-64 px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-gray-100 text-sm shadow-md focus:outline-none"
          />
          {query && (
            <ul className="absolute top-12 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-gray-400">No items found</li>
              ) : (
                results.map((item) => (
                  <li
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-white"
                  >
                    {item.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <button
          className="text-cyan-400 cursor-pointer hover:text-cyan-300"
          onClick={() => navigate("/")}
        >
          Home
        </button>
        <button
          className="text-cyan-400 cursor-pointer hover:text-cyan-300"
          onClick={() => navigate("/about")}
        >
          About
        </button>
        <button
          className="text-cyan-400 cursor-pointer hover:text-cyan-300"
          onClick={() => navigate("/contact")}
        >
          Contact
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
            >
              Logout
            </button>
            <Toast
              notification={notification}
              className="min-w-[180px] cursor-pointer right-0 left-auto"
            />
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 cursor-pointer bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white"
            >
              Login / Signup
            </button>
            <Toast
              notification={notification}
              className="min-w-[180px]"
            />
          </div>
        )}
      </div>

      {/* Mobile menu & search omitted for brevity (same logic as desktop) */}
    </nav>
  );
};

export default Navbar;
