import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- 🌐 API Configuration Start ---
const API_RAW = "https://x-market-backend-production-d2c4.up.railway.app";
const API_CLEAN = API_RAW.replace(/\/$/, "");

const api = axios.create({
  baseURL: API_CLEAN + "/api",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

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
    // ✅ ပြင်ဆင်ချက် - API_BASE_URL မရှိသော error ကိုရှောင်ရန် API_CLEAN ကိုသုံးပါ
    console.log("🚀 Testing Endpoint:", API_CLEAN + "/api/send-otp");

    try {
      await api.post('send-otp', { email });
      
      setCodeSent(true);
      setCountdown(60);
      alert(`✅ Success: Verification code sent to ${email}. Please check your Mailtrap Inbox!`);
    } catch (err) {
      console.error("❌ OTP Error:", err);
      alert(err.response?.data?.message || '❌ Network Error: Backend connection failed.');
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
      const res = await api.post('register', { 
        email, 
        password, 
        otp: verificationCode 
      });
      alert(`🎉 ${res.data.message}`);
      navigate('/login'); 
    } catch (err) {
      console.error("❌ Register Error:", err);
      alert(err.response?.data?.message || '❌ Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E2329] rounded-2xl border border-[#2B3139] p-8 relative shadow-2xl">
        <button onClick={() => navigate('/')} className="absolute top-5 right-5 text-gray-500 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center mb-8">
          <h2 className="text-white text-3xl font-bold">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Professional Crypto Exchange Portal</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Email Address</label>
            <input type="email" placeholder="name@email.com" className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none" onChange={(e) => setEmail(e.target.value)} required disabled={codeSent && countdown > 0} />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Password</label>
            <input type="password" placeholder="Minimum 8 characters" className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none" onChange={(e) => setPassword(e.target.value)} required minLength="8" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Verification Code</label>
            <div className="flex gap-3">
              <input type="text" placeholder="6-digit code" maxLength="6" className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3.5 text-white focus:border-yellow-500 outline-none tracking-[0.5em] text-center font-bold" onChange={(e) => setVerificationCode(e.target.value)} required={codeSent} disabled={!codeSent} />
              <button type="button" onClick={handleSendCode} disabled={loading || countdown > 0 || !email} className={`px-4 rounded-xl text-xs font-bold transition-all min-w-[100px] ${countdown > 0 ? 'bg-[#2B3139] text-gray-500' : 'bg-[#2B3139] hover:bg-yellow-500 hover:text-black text-white'}`}>{loading ? 'Sending...' : (countdown > 0 ? `Resend (${countdown}s)` : (codeSent ? 'Resend' : 'Get Code'))}</button>
            </div>
          </div>
          <button type="submit" disabled={loading || !codeSent || !verificationCode} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-all mt-4 disabled:opacity-30">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;