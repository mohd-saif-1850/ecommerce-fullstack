import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputRefs = useRef([]);
  const email = location.state?.email || localStorage.getItem("pendingVerifyEmail") || "";

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const otpValue = otp.join("");
    if (otpValue.trim() === "") return setError("Please enter the OTP!");
    if (!email) return setError("Missing email — please go back and sign up again.");

    setLoading(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/users/verify-user`,
        { email, otp: Number(otpValue) },
        { timeout: 20000 }
      );

      if (res?.data?.success) {
        localStorage.removeItem("pendingVerifyEmail");
        setInfo("Account verified! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { state: { msg: "Account verified! Please login." } });
        }, 1000);
      } else {
        setError(res?.data?.error || "OTP verification failed!");
      }
    } catch (err) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-3">Verify OTP</h2>
        <p className="text-gray-400 mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="text-white font-medium">{email || "your email"}</span>
        </p>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {info && <p className="text-green-400 mb-3">{info}</p>}

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength="1"
                inputMode="numeric"
                className="w-12 h-12 text-center text-xl bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${loading
                ? "bg-cyan-500/50 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
              } text-white`}
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 inline-block"></span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
          Didn’t receive the code?{" "}
          <span className="text-cyan-400 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
