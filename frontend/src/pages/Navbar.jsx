import { useState, useEffect, useCallback } from "react";
import { Menu, X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Inline toast that renders under its relative parent
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
    <div className={`${base} ${style} ${className}`} role="status" aria-live="polite">
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

  // notification state
  const [notification, setNotification] = useState(null);
  const [notifTimer, setNotifTimer] = useState(null);

  // display a notification for 5 seconds
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

  // fetch user from backend
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/users/get-user");
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      return true;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      return false;
    }
  }, []);

  useEffect(() => {
    // on mount, validate with backend
    fetchUser();

    const onAuthChanged = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        setUser(stored || null);
      } catch {
        setUser(null);
      }
      fetchUser();

      // read notification (if any) from localStorage
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

    const onStorage = (e) => {
      if (e.key === "auth-ts" || e.key === "auth-notification") {
        onAuthChanged();
      }
    };

    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
      if (notifTimer) clearTimeout(notifTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUser, notifTimer]);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout-user");
    } catch (err) {
      console.error("Logout failed", err);
      // continue client cleanup even on server error
    }

    setUser(null);
    localStorage.removeItem("user");

    const notif = { message: "Logged out successfully", type: "success", ts: Date.now() };
    showNotification(notif);
    localStorage.setItem("auth-notification", JSON.stringify(notif));
    localStorage.setItem("auth-ts", notif.ts.toString());
    window.dispatchEvent(new Event("authChanged"));

    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  // search logic
  useEffect(() => {
    if (!query) return setResults([]);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/admin/search-items", { params: { query: query.trim() } });
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
    <nav className="w-full px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50 bg-transparent">
      <div className="text-2xl font-bold text-cyan-400 cursor-pointer" onClick={() => navigate("/")}>
        MyShop
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4">
        {/* search input */}
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
                  <li key={item._id} onClick={() => handleSelect(item)} className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-white">
                    {item.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <button className="text-cyan-400 hover:text-cyan-300" onClick={() => navigate("/")}>Home</button>
        <button className="text-cyan-400 hover:text-cyan-300" onClick={() => navigate("/about")}>About</button>
        <button className="text-cyan-400 hover:text-cyan-300" onClick={() => navigate("/contact")}>Contact</button>

        {user ? (
          <div className="relative">
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white">
              Logout
            </button>
            <Toast notification={notification} className="min-w-[180px] right-0 left-auto" />
          </div>
        ) : (
          <div className="relative">
            <button onClick={() => navigate("/login")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white">
              Login / Signup
            </button>
            <Toast notification={notification} className="min-w-[180px]" />
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="p-2 rounded-full hover:bg-gray-700 transition">
          <Search className="w-5 h-5 text-cyan-400" />
        </button>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-gray-700 transition">
          {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
        </button>
      </div>

      {mobileSearchOpen && (
        <div className="absolute right-4 top-16 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} placeholder="Search items..." className="w-full px-3 py-2 rounded-t-lg bg-gray-800 text-gray-100 focus:outline-none" />
          <ul className="max-h-60 overflow-auto">
            {results.length === 0 ? <li className="px-3 py-2 text-gray-400">No items found</li> : results.map((item) => <li key={item._1d} onClick={() => handleSelect(item)} className="px-3 py-2 hover:bg-gray-800 cursor-pointer">{item.name}</li>)}
          </ul>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="absolute right-4 top-16 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg flex flex-col py-2">
          <button onClick={() => { navigate("/"); setMobileMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-800">Home</button>
          <button onClick={() => { navigate("/about"); setMobileMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-800">About</button>
          <button onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-800">Contact</button>

          {user ? (
            <div className="relative px-3 py-2">
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full px-3 py-2 bg-red-600 rounded-lg text-white">Logout</button>
              <Toast notification={notification} className="min-w-[160px] left-0" />
            </div>
          ) : (
            <div className="relative px-3 py-2">
              <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full px-3 py-2 bg-cyan-600 rounded-lg text-white">Login / Signup</button>
              <Toast notification={notification} className="min-w-[160px] left-0" />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
