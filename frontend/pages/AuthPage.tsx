import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (type === 'login') {
        await login(email, role);
      } else {
        await register(name, email, role);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {type === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {type === 'login' ? "New to Skill-Link? " : "Already a member? "}
              <Link 
                to={type === 'login' ? '/register' : '/login'} 
                className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                {type === 'login' ? 'Create an account' : 'Sign in'}
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {type === 'register' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">I am looking to...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.SEEKER)}
                  className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg text-sm font-bold transition-all ${
                    role === UserRole.SEEKER
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Hire a Pro
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.PROVIDER)}
                  className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg text-sm font-bold transition-all ${
                    role === UserRole.PROVIDER
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Find Work
                </button>
              </div>
            </div>

            {/* Admin Toggle (Hidden/Dev only visual) */}
            {type === 'login' && (
               <div className="flex items-center pt-2">
                 <input 
                    id="admin-mode"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    checked={role === UserRole.ADMIN}
                    onChange={(e) => setRole(e.target.checked ? UserRole.ADMIN : UserRole.SEEKER)}
                 />
                 <label htmlFor="admin-mode" className="ml-2 block text-xs text-slate-400 font-medium">
                    Admin Access
                 </label>
               </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <span className="flex items-center gap-2">
                      {type === 'login' ? 'Sign in' : 'Create Account'} <ArrowRight className="h-4 w-4" />
                  </span>
              )}
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Credentials</p>
             <div className="space-y-1 text-xs text-slate-600 font-mono">
               <div className="flex justify-between"><span>Seeker:</span> <span>john@example.com / pass</span></div>
               <div className="flex justify-between"><span>Provider:</span> <span>alice@example.com / pass</span></div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900">
             {/* Abstract Pattern */}
             <div className="absolute inset-0 opacity-10" style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                 backgroundSize: '32px 32px'
             }}></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                Expert services,<br/>
                <span className="text-emerald-400">right around the corner.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed">
                Join thousands of neighbors who trust Skill-Link for home repairs, tutoring, and professional services.
            </p>
            
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-lg">Verified Professionals</p>
                        <p className="text-sm text-slate-400">Every provider undergoes a strict background check.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 border border-emerald-500/30">
                        <Star size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-lg">Quality Guaranteed</p>
                        <p className="text-sm text-slate-400">Read real reviews from your neighbors.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};