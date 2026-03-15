import { useState } from "react";
import "./AuthPage.css";  // Import CSS
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("form"); // form | security
  const [isLoading, setIsLoading] = useState(false); // Added for API loading
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const securityQuestions = [
    "What was your childhood nickname?",
    "What is the name of your first school?",
    "What is your favorite food?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was your first pet's name?",
    "Who is your favorite teacher?",
    "What is your favorite movie?",
    "What is your favorite color?",
    "What is your best friend's name?",
  ];

  const [answers, setAnswers] = useState(Array(10).fill(""));

  // ────────────────────────────────────────────────
  //  DIRECT API CONFIG – for easy debugging
  // ────────────────────────────────────────────────
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';  // From .env

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── DIRECT API CALL: Login ──────────────────────
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      console.log('API CALL: POST /auth/login', { email: formData.email, password: formData.password });  // Debug log

      const response = await fetch(`${API_BASE}/users/login`, {  // Replace with your endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth if needed: 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);  // Assume JWT – store token for future calls
      console.log('API SUCCESS: Login response', data);  // Debug log
      alert("Login successful!");
      navigate("/select-role");  // Go to dashboard/home
    } catch (err) {
      console.error('API ERROR: Login failed', err);  // Debug log
      setError(err.message || "Login failed – check console for details");
    } finally {
      setIsLoading(false);
    }
  };

  // ── DIRECT API CALL: Register ───────────────────
  const handleRegister = async (securityAnswers) => {
    setIsLoading(true);
    setError("");
    try {
      console.log('API CALL: POST /auth/register', { 
        name: formData.name,
        email: formData.email,
        password: formData.password,
        securityAnswers 
      });  // Debug log

      const response = await fetch(`${API_BASE}/users/register`, {  // Replace with your endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          securityAnswers: securityAnswers,  // Array of answers
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API SUCCESS: Register response', data);  // Debug log
      alert("Account created successfully!");
      setIsLogin(true);
      setStep("form");
    } catch (err) {
      console.error('API ERROR: Register failed', err);  // Debug log
      setError(err.message || "Registration failed – check console for details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      handleLogin();  // Call direct API
      return;
    }

    setStep("security");  // Proceed to questions for signup
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSecuritySubmit = () => {
    const answeredCount = answers.filter((a) => a.trim().length > 0).length;

    if (answeredCount < 3) {
      setError("Please answer at least 3 security questions.");
      return;
    }

    setError("");
    handleRegister(answers);  // Call direct API with answers
  };

  const handleForgotPassword = () => {
    navigate("/reset-password");  // Assuming you have this route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-blue-500 to-indigo-600 p-4 animate-gradient-x relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center mb-8 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse-slow">
          {isLogin ? "Welcome Back" : step === "form" ? "Create Account" : "Security Questions"}
        </h2>

        {/* LOGIN / SIGNUP FORM */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {!isLogin && (
              <div className="transform transition-all duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-purple-300"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="transform transition-all duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-purple-300"
                required
              />
            </div>

            <div className="transform transition-all duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-purple-300"
                required
              />
            </div>

            {error && isLogin && (
              <p className="text-red-500 text-center font-medium animate-shake">⚠ {error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] hover:shadow-2xl shadow-lg active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Processing..." : (isLogin ? "Login" : "Continue")}
            </button>
          </form>
        )}

        {/* SECURITY QUESTIONS */}
        {step === "security" && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm text-gray-600 text-center mb-6 animate-bounce-slow">
              Answer at least 3 questions for account recovery
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {securityQuestions.map((q, i) => (
                <div key={i} className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{q}</label>
                  <input
                    type="text"
                    value={answers[i]}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-purple-300"
                  />
                </div>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-center font-medium animate-shake">⚠ {error}</p>
            )}

            <button
              onClick={handleSecuritySubmit}
              disabled={isLoading}
              className={`w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] hover:shadow-2xl shadow-lg active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Creating Account..." : "Submit & Create Account"}
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {isLogin && step === "form" && (
          <div className="text-center mt-6 animate-fade-in">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-purple-600 hover:text-purple-800 font-medium transition-all hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* TOGGLE LOGIN / SIGNUP */}
        {step === "form" && (
          <p className="text-center mt-6 text-gray-600 animate-fade-in">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-purple-600 hover:text-purple-800 font-semibold transition-all hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}