import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Cpu,
  UserCheck
} from "lucide-react";
import { authService } from "../../services/authService";
import { useShop } from "../../context/ShopContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useShop();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const from = (location.state as any)?.from?.pathname || "/profile";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.login({
        email: email.trim(),
        password
      });

      refreshUser();

      // Check if admin
      if (res.user?.roles?.includes("Admin")) {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else if (err?.response?.data?.errors) {
        const errorValues = Object.values(err.response.data.errors).flat();
        setErrorMsg(errorValues.join(" "));
      } else if (err?.response?.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else if (err?.code === "ERR_NETWORK") {
        setErrorMsg("Unable to connect to TechXpress backend server. Please verify backend is running on http://localhost:5132.");
      } else {
        setErrorMsg(err?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (type: "customer" | "admin") => {
    if (type === "admin") {
      setEmail("admin@techxpress.com");
      setPassword("Admin12345!");
    } else {
      setEmail("customer@techxpress.com");
      setPassword("Customer12345!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Tech<span className="text-indigo-600">Xpress</span>
            </span>
          </Link>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to TechXpress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Access your saved builds, order history, and enterprise hardware pricing.
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] font-semibold text-slate-400">
                  Min. 8 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600 font-medium">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Autofill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("customer")}
                className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Administrator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link to Register */}
        <div className="text-center text-xs text-slate-500">
          <span>Don't have a TechXpress account yet? </span>
          <Link
            to="/register"
            className="font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
