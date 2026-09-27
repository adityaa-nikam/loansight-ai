import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Aperture,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/common/LanguageSelector';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validation';
import { ROUTES } from '../constants/routes';

const validationRules = {
  name: [
    (v) => validators.required(v, 'Full name'),
    validators.minLength(2, 'Name'),
    validators.maxLength(100, 'Name'),
  ],
  email: [
    (v) => validators.required(v, 'Email address'),
    validators.email,
  ],
  password: [
    (v) => validators.required(v, 'Password'),
    validators.minLength(8, 'Password'),
  ],
  confirmPassword: [
    (v) => validators.required(v, 'Password confirmation'),
  ],
};

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationRules,
    onSubmit: async (data) => {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      await register(data.name, data.email, data.password);
      navigate(ROUTES.APPLICANT, { replace: true });
    },
  });

  const confirmPasswordError = touched.confirmPassword
    ? errors.confirmPassword || (values.confirmPassword && values.password !== values.confirmPassword ? 'Passwords do not match' : null)
    : null;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Brand */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
          <span className="w-10 h-10 rounded-xl bg-emerald-500 grid place-items-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Aperture className="w-5 h-5 text-navy-900" />
          </span>
          <div>
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              {t('brand_name')} <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AI</span>
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5">{t('brand_tagline')}</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector variant="dark" />
          <Link
            to={ROUTES.LOGIN}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900"
          >
            {t('already_have_account')} <span className="text-emerald-400 font-bold ml-1">{t('sign_in')}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Benefits & Trust */}
          <div className="lg:col-span-6 space-y-8 hidden md:block">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-emerald-400 shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                Fast-Track Paperless Loan Applications
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Apply for personal & home loans in minutes.
              </h1>
              <p className="text-slate-400 text-base max-w-lg leading-relaxed">
                Connect with top lending partners, upload required income documents safely, and get real-time AI eligibility verification.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-300 font-medium">Compare offers from 6 top leading banks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-300 font-medium">Automated OCR extraction from PAN, Aadhaar & Salary Slips</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-300 font-medium">Direct status tracking and instant officer feedback</span>
              </div>
            </div>
          </div>

          {/* Right Column: Register Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Create Applicant Account
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Get started with your loan application today
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Rohit Sharma"
                      autoComplete="name"
                      className={`
                        w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 transition-all duration-200
                        ${touched.name && errors.name
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }
                      `}
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`
                        w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 transition-all duration-200
                        ${touched.email && errors.email
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }
                      `}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className={`
                        w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 transition-all duration-200
                        ${touched.password && errors.password
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className={`
                        w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 transition-all duration-200
                        ${confirmPasswordError
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }
                      `}
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{confirmPasswordError}</p>
                  )}
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-fade-in flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {submitError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-navy-950 bg-emerald-500 hover:bg-emerald-400
                    shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200
                    flex items-center justify-center gap-2 cursor-pointer
                    ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'active:scale-[0.99]'}
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account & Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                  >
                    Sign in to your account
                  </Link>
                </p>
              </div>

              {/* Security Tag */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted • Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/50">
        LoanSight AI Underwriting Platform © {new Date().getFullYear()}. Secure digital onboarding.
      </footer>
    </div>
  );
}
