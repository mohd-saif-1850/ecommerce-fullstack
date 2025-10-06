import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // important to send cookies
});

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = data.username.includes("@")
        ? { email: data.username.trim(), password: data.password }
        : { username: data.username.trim(), password: data.password };

      const res = await api.post("/users/login-user", payload);

      if (res.data?.user) {
        // save user info locally
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // dispatch event for navbar
        window.dispatchEvent(new Event("authChanged"));

        navigate("/");
      } else {
        setError(res.data?.error || "Invalid credentials!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-center text-3xl font-bold mb-6 text-cyan-500">
          Login
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            value={data.username}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-bold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <span
            className="text-cyan-400 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
