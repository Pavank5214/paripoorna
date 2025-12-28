import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../private/AuthContext";
import { Lock, Mail, ArrowRight, HardHat, AlertCircle } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(""); // Clear error on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Left Column - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-slate-800 border-r border-slate-700">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest mb-8">
            <HardHat className="w-4 h-4" />
            <span>BuildTrack Pro</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight uppercase tracking-tight">
            Construction <br />
            <span className="text-amber-500">Management</span> <br />
            Platform
          </h1>
          <p className="mt-6 text-slate-400 text-lg max-w-md leading-relaxed">
            Streamline your projects, manage resources, and track progress with industrial-grade precision.
          </p>
        </div>

        <div className="z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-1">Real-time</h3>
            <p className="text-slate-400 text-sm">Live tracking of site activities and resource allocation.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-1">Analytics</h3>
            <p className="text-slate-400 text-sm">Advanced cost estimation and project forecasting.</p>
          </div>
        </div>

        <div className="z-10 text-slate-500 text-xs font-mono">
          <p>© 2024 PARIPOORNA ENTERPRISES. SYSTEM V2.0</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-6 sm:p-12 pt-16 lg:pt-12 relative z-10">

        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Build<span className="text-amber-500">Track</span>
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Staff Login</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Access your project dashboard</p>
            </div>

            {message && (
              <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-600">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your work email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-400 text-xs">
              <p>Authorized Personnel Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;