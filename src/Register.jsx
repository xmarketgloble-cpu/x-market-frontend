import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email first.');
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/send-otp', { email });
      setCodeSent(true);
      alert(`Verification code sent to ${email}. Check your inbox!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!codeSent || !verificationCode) return alert('Please verify your email first.');
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/register', { 
        email, password, otp: verificationCode 
      });
      alert(res.data.message);
      navigate('/login'); 
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E2329] rounded-2xl border border-[#2B3139] p-8 relative shadow-2xl">
        
        <button onClick={() => navigate('/')} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-white text-3xl font-bold">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Join X Market today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Email Address</label>
            <input 
              type="email" placeholder="name@email.com"
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none disabled:opacity-50"
              onChange={(e) => setEmail(e.target.value)} required disabled={codeSent}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Password</label>
            <input 
              type="password" placeholder="Minimum 8 characters"
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              onChange={(e) => setPassword(e.target.value)} required minLength="8"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Verification Code</label>
            <div className="flex gap-3">
              <input 
                type="text" placeholder="6-digit code" maxLength="6"
                className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none tracking-widest disabled:opacity-50"
                onChange={(e) => setVerificationCode(e.target.value)} required={codeSent} disabled={!codeSent}
              />
              <button 
                type="button" onClick={handleSendCode} disabled={loading || codeSent || !email}
                className="bg-[#2B3139] hover:bg-yellow-500 hover:text-black text-white px-4 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {codeSent ? 'Sent' : 'Get Code'}
              </button>
            </div>
          </div>

          <button disabled={loading || !codeSent} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3.5 rounded-xl transition mt-4 disabled:opacity-50">
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;