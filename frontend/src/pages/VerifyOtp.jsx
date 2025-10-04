import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const email = location.state?.email || localStorage.getItem("pendingVerifyEmail") || "";

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otp) return setError("Please enter the OTP!");
    if (!email) return setError("Missing email — please go back and sign up again.");

    setLoading(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/users/verify-user`,
        { email, otp: Number(otp) },
        { timeout: 20000 }
      );

      console.log("Verify response:", res?.data);

      if (res?.data?.success) {
        localStorage.removeItem("pendingVerifyEmail");
        setInfo("Account verified! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { state: { msg: "Account verified! Please login." } });
        }, 900);
      } else {
        setError(res?.data?.error || "OTP verification failed!");
      }
    } catch (err) {
      console.error("Verify error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "OTP verification failed due to network/server error.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-xl shadow-xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-cyan-500 mb-4">Verify OTP</h2>

        <p className="text-gray-400 mb-2">
          Enter the OTP sent to <span className="text-white">{email || "your email"}</span>
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {info && <p className="text-green-400 mb-4">{info}</p>}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            placeholder="Enter OTP"
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
            inputMode="numeric"
            pattern="\d*"
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
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="text-sm text-gray-500 mt-4">
          <p>If you didn't receive the OTP, check spam or re-signup to resend the code.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
