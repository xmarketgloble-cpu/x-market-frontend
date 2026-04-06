import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🌐 Professional Dynamic API Configuration
// Railway URL အသစ်ကို အောက်မှာ အသေအချာ ထည့်သွင်းပေးထားပါတယ်
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://x-market-backend-production-d2c4.up.railway.app"; // ✨ d2c4 ပါဝင်သော URL အသစ်သို့ အတိအကျ ပြောင်းလဲထားသည်

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0); // OTP resend timer အတွက်
  const navigate = useNavigate();

  // ⏲️ Timer Logic (OTP ပို့ပြီးရင် စက္ကန့် ၆၀ စောင့်ခိုင်းဖို့)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!email) return alert('Please enter your email first.');
    
    setLoading(true);
    try {
      // ✅ Railway Backend သစ်သို့ လှမ်းခေါ်ခြင်း (API_BASE_URL/api/send-otp)
      const res = await axios.post(`${API_BASE_URL}/api/send-otp`, { email });
      setCodeSent(true);
      setCountdown(60); // 60s timer စတင်ခြင်း
      alert(`✅ Success: Verification code sent to ${email}. Please check your Mailtrap Inbox!`);
    } catch (err) {
      console.error("OTP Error Details:", err);
      // Backend Online မဖြစ်ခြင်း သို့မဟုတ် URL လွဲနေခြင်းကို အသိပေးရန်
      alert(err.response?.data?.message || '❌ Failed to send code. Make sure your Backend URL is correct and Online.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!codeSent) return alert('Please request a verification code first.');
    if (!verificationCode) return alert('Please enter the 6-digit code.');
    
    setLoading(true);
    try {
      // ✅ Register Logic (API_BASE_URL/api/register)
      const res = await axios.post(`${API_BASE_URL}/api/register`, { 
        email, 
        password, 
        otp: verificationCode 
      });
      alert(`🎉 ${res.data.message}`);
      navigate('/login'); 
    } catch (err) {
      alert(err.response?.data?.message || '❌ Registration failed. Try a new code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E2329] rounded-2xl border border-[#2B3139] p-8 relative shadow-2xl">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-white text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Professional Crypto Exchange Portal</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Email Address</label>
            <input 
              type="email" 
              placeholder="name@email.com"
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none disabled:opacity-50 transition-all placeholder:text-gray-600"
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={codeSent && countdown > 0}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Password</label>
            <input 
              type="password" 
              placeholder="Minimum 8 characters"
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="8"
            />
          </div>

          {/* OTP Verification Section */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Verification Code</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="6-digit code" 
                maxLength="6"
                className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none tracking-[0.5em] text-center font-bold disabled:opacity-50 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                onChange={(e) => setVerificationCode(e.target.value)} 
                required={codeSent} 
                disabled={!codeSent}
              />
              <button 
                type="button" 
                onClick={handleSendCode} 
                disabled={loading || countdown > 0 || !email}
                className={`px-4 rounded-xl text-xs font-bold transition-all min-w-[100px] ${
                  countdown > 0 
                  ? 'bg-[#2B3139] text-gray-500 cursor-not-allowed' 
                  : 'bg-[#2B3139] hover:bg-yellow-500 hover:text-black text-white'
                }`}
              >
                {loading ? 'Sending...' : (countdown > 0 ? `Resend (${countdown}s)` : (codeSent ? 'Resend Code' : 'Get Code'))}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || !codeSent || !verificationCode} 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-all mt-4 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
                Already have an account? <span onClick={() => navigate('/login')} className="text-yellow-500 hover:underline cursor-pointer">Log In</span>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Register;