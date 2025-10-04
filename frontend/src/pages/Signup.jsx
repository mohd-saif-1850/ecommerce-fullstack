import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !username || !email || !password) {
      return setError("Please fill in all required fields!");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/register-user`,
        { name, username, email, mobile, password }
      );

      console.log("Signup response:", res?.data);

      localStorage.setItem("pendingVerifyEmail", email);

      if (res?.data?.success) {
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(res?.data?.error || "Signup failed!");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Signup failed due to network/server error.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-center text-3xl font-bold mb-6 text-cyan-500">
          Sign Up
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <input
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 ${loading ? "opacity-80 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <span className="animate-spin border-b-2 border-white rounded-full w-5 h-5"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <span
            className="text-cyan-400 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
