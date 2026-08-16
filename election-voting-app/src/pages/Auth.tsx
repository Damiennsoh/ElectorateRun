import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';


export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        // The App component's auth listener will handle the redirect
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        alert('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4">
      {/* Branding / Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="flex flex-col gap-0.5">
          <div className="w-6 h-1 bg-[#00AEEF] rounded-full opacity-40"></div>
          <div className="w-8 h-1 bg-[#00AEEF] rounded-full opacity-70"></div>
          <div className="w-10 h-1 bg-[#00AEEF] rounded-full"></div>
        </div>
        <h1 className="text-4xl font-normal text-[#333] flex items-center">
          <span className="text-[#00AEEF] font-semibold tracking-tight">electorate</span>
          <span className="text-[#333] tracking-tight">run</span>
        </h1>
      </div>

      {/* Auth Card */}
      <div className="max-w-[420px] w-full bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-[#333] mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#E8F0FE] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
              placeholder="voter@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[13px] font-bold text-[#333]">
                Password
              </label>
              <button
                type="button"
                className="text-[10px] font-bold text-[#00AEEF] hover:underline uppercase"
              >
                I CAN'T REMEMBER
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#E8F0FE] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-base"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Switch Link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xl text-[#00AEEF] font-light hover:underline"
        >
          {isLogin
            ? "No account? Create one for free!"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};
