import { useState, useEffect } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { mode, setMode } = useTheme();
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Navigate when an item is selected
  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    navigate(`/items/${item._id}`);
    setMobileSearchOpen(false);
  };

  // Enter key handling
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!query) return setResults([]);

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/admin/search-items`,
          { params: { query: query.trim() } }
        );
        setResults(res.data.items || []);
      } catch (err) {
        console.log(err);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div className="text-2xl font-bold text-cyan-600">MyShop</div>

      {/* Right Side */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search items..."
            className="w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 shadow-md focus:outline-none transition"
          />
          {query && (
            <ul className="absolute top-12 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No items found
                </li>
              ) : (
                results.map((item) => (
                  <li
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {item.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Desktop Links */}
        <a href="/" className="hover:text-cyan-600 dark:text-gray-200 hidden md:block">
          Home
        </a>
        <a href="/about" className="hover:text-cyan-600 dark:text-gray-200 hidden md:block">
          About Us
        </a>
        <a href="/contact" className="hover:text-cyan-600 dark:text-gray-200 hidden md:block">
          Contact Us
        </a>

        {/* Mobile Search */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          {mobileSearchOpen && (
            <div className="absolute right-0 top-12 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search items..."
                className="w-full px-3 py-2 rounded-t-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              />
              <ul className="max-h-60 overflow-auto">
                {results.length === 0 ? (
                  <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    No items found
                  </li>
                ) : (
                  results.map((item) => (
                    <li
                      key={item._id}
                      onClick={() => handleSelect(item)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {item.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setMode(!mode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {mode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>

        {/* Auth Buttons */}
        {user ? (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => login("DemoUser")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow"
          >
            Login / Signup
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
