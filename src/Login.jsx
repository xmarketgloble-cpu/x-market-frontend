import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userBalance', res.data.user.balance);
      localStorage.setItem('userRole', res.data.user.role); 
      localStorage.setItem('isVerified', res.data.user.isVerified); 

      if (setUser) {
        setUser({ 
          email: res.data.user.email,
          balance: res.data.user.balance, 
          role: res.data.user.role,       
          isVerified: res.data.user.isVerified, 
          holdings: res.data.user.holdings,
          profilePic: res.data.user.profilePic
        });
      }
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E2329] rounded-[40px] border border-[#2B3139] p-10 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all bg-[#0B0E11] hover:bg-white/10 p-2.5 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/30 transform rotate-6">
            <span className="text-black font-black text-4xl">X</span>
          </div>
          <h2 className="text-white text-4xl font-black tracking-tighter">LOGIN</h2>
          <p className="text-gray-500 text-xs mt-3 font-bold uppercase tracking-[0.2em] opacity-70">Secure Access</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-wider px-5 py-4 rounded-2xl mb-8 text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          {/* Email Field */}
          <div className="group">
            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-yellow-500 transition-colors">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full h-[60px] bg-[#0B0E11] border-2 border-[#2B3139] rounded-2xl px-6 text-white focus:border-yellow-500 outline-none transition-all text-sm font-bold"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }} 
              required 
            />
          </div>

          {/* Password Field */}
          <div className="group">
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] group-focus-within:text-yellow-500 transition-colors">Password</label>
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')} 
                className="text-yellow-500 text-[10px] font-black hover:text-yellow-400 uppercase tracking-widest transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full h-[60px] bg-[#0B0E11] border-2 border-[#2B3139] rounded-2xl px-6 text-white focus:border-yellow-500 outline-none transition-all text-sm font-bold"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500"
              >
                {showPassword ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* 🚀 LOGIN BUTTON (FIXED HEIGHT & SOLID LOOK) */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-[65px] bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:opacity-50 text-black font-black rounded-2xl transition-all duration-300 shadow-2xl shadow-yellow-500/20 flex justify-center items-center text-sm uppercase tracking-[0.3em] active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Login to Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            No account? 
            <button 
              onClick={() => navigate('/register')} 
              className="ml-3 text-yellow-500 hover:text-yellow-400 transition underline underline-offset-8"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;