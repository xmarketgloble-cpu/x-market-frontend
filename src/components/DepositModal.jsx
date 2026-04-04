// src/components/DepositModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
// 🔥 Professional Update: Router ကို အသုံးပြု၍ Page ကူးရန် useNavigate ကို ထည့်သွင်းပါသည်
import { useNavigate } from 'react-router-dom';

function DepositModal({ isOpen, onClose, onDepositSuccess, showAlert }) {
  const [view, setView] = useState('menu'); // menu | fiat | crypto

  // --- CURRENCY SELECTOR STATES ---
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  // --- FIAT DEPOSIT STATES ---
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('KPay');
  const [slip, setSlip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CRYPTO DEPOSIT STATES ---
  const [cryptoStep, setCryptoStep] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // 🔥 Router ကို အသုံးပြုရန်
  const navigate = useNavigate();

  // 🌍 Mock Data for Currencies (Binance Style)
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', color: 'bg-yellow-500 text-black' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', color: 'bg-green-500 text-white' },
    { code: 'IDR', name: 'Indonesia Rupiah', symbol: 'Rp', color: 'bg-red-500 text-white' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', color: 'bg-blue-500 text-white' },
    { code: 'AED', name: 'United Arab Emirates dirham', symbol: 'د.إ', color: 'bg-emerald-500 text-white' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', color: 'bg-blue-600 text-white' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', color: 'bg-pink-600 text-white' },
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const cryptoCoins = ['USDT', 'USDC', 'BNB', 'BTC', 'ETH'];
  const networkOptions = {
    'USDT': ['TRC20', 'ERC20', 'BEP20'],
    'USDC': ['ERC20', 'SOL'],
    'BNB': ['BEP20', 'BEP2'],
    'BTC': ['BTC', 'BEP20'],
    'ETH': ['ERC20', 'BEP20'],
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setView('menu');
    setAmount('');
    setSlip(null);
    setCryptoStep(1);
    setSelectedCoin(null);
    setSelectedNetwork(null);
    setIsCurrencySelectorOpen(false);
    setCurrencySearch('');
    onClose();
  };

  const handleFiatSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !slip) return showAlert("Please fill all fields and upload slip!", "error");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('method', method);
    formData.append('slip', slip);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/deposit', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      showAlert("Deposit request submitted successfully! Pending approval.", "success");
      onDepositSuccess();
      handleClose();
    } catch (err) {
      showAlert(err.response?.data?.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMockAddress = () => {
    if (!selectedCoin || !selectedNetwork) return '';
    return `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}...${selectedCoin}`;
  };

  // Get current active currency object
  const activeCurrency = currencies.find(c => c.code === fiatCurrency) || currencies[0];

  // 🔥 P2P Trading ခလုတ်ကို နှိပ်လျှင် အလုပ်လုပ်မည့် Function
  const goToP2P = () => {
    handleClose(); // ပထမဆုံး Modal ကို ပိတ်ပါမည်
    navigate('/p2p'); // ပြီးနောက် P2P စာမျက်နှာသို့ ကူးပြောင်းပါမည်
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden transform transition-all animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* 🌟 STEP 1: MENU UI WITH CURRENCY DROPDOWN */}
        {view === 'menu' && (
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Currency Selector Button */}
            <div className="mb-6 relative z-10">
              <button 
                onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isCurrencySelectorOpen ? 'border-yellow-500 bg-[#0B0E11]' : 'border-[#2B3139] bg-[#0B0E11] hover:border-yellow-500/50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${activeCurrency.color}`}>
                  {activeCurrency.symbol}
                </span>
                <span className="text-white font-bold text-sm">{activeCurrency.code}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCurrencySelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>

            {/* IF CURRENCY SELECTOR IS OPEN */}
            {isCurrencySelectorOpen ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="relative mb-6">
                  <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" placeholder="Search" 
                    value={currencySearch} onChange={(e) => setCurrencySearch(e.target.value)}
                    className="w-full bg-[#0B0E11] border border-[#2B3139] text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-yellow-500 transition-all text-sm font-medium"
                  />
                </div>
                <p className="text-gray-500 text-xs font-bold mb-3 tracking-wide">Select Payment Currency</p>
                <div className="space-y-1 pr-2">
                  {filteredCurrencies.map(c => (
                    <div 
                      key={c.code} 
                      onClick={() => { setFiatCurrency(c.code); setIsCurrencySelectorOpen(false); setCurrencySearch(''); }} 
                      className="flex items-center gap-4 p-3 hover:bg-[#2B3139] rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${c.color} shadow-sm group-hover:scale-110 transition-transform`}>
                        {c.symbol}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{c.code}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{c.name}</div>
                      </div>
                      {fiatCurrency === c.code && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-yellow-500"></div>
                      )}
                    </div>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No currencies found.</p>
                  )}
                </div>
              </div>
            ) : (
              /* NORMAL MENU VIEW */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-white font-extrabold text-lg mb-4 tracking-tight">I don't have crypto assets</h3>
                  
                  {/* Buy with USD/Fiat */}
                  <div 
                    onClick={() => setView('fiat')}
                    className="flex items-start gap-4 p-5 border border-[#2B3139] rounded-2xl cursor-pointer hover:bg-white/5 transition-colors mb-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B0E11] border border-[#2B3139] group-hover:border-yellow-500 flex items-center justify-center transition-colors">
                      <div className="w-4 h-4 bg-yellow-500 rounded-sm rotate-45 flex items-center justify-center">
                         <div className="w-2 h-2 bg-[#0B0E11] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Buy with {fiatCurrency}</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Buy crypto easily via bank transfer, card, and more.</p>
                    </div>
                  </div>

                  {/* 🔥 P2P Trading Button Update */}
                  <div 
                    onClick={goToP2P} // Alert အစား goToP2P function ကို ပြောင်းသုံးထားပါသည်
                    className="flex items-start gap-4 p-5 border border-[#2B3139] rounded-2xl cursor-pointer hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B0E11] border border-[#2B3139] group-hover:border-yellow-500 flex items-center justify-center transition-colors relative">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-500 rounded-sm rotate-45"></div>
                      <div className="absolute top-3 right-2 w-1 h-1 bg-gray-500 rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-gray-500 rounded-sm"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">P2P Trading</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Buy directly from users. Competitive pricing. Local payments.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-white font-extrabold text-lg mb-4 tracking-tight">I have crypto assets</h3>
                  
                  {/* Deposit Crypto */}
                  <div 
                    onClick={() => setView('crypto')}
                    className="flex items-start gap-4 p-5 border border-[#2B3139] rounded-2xl cursor-pointer hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B0E11] border border-[#2B3139] group-hover:border-yellow-500 flex items-center justify-center transition-colors">
                       <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Deposit Crypto</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Send crypto directly to your X Market Account via blockchain.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🌟 FIAT DEPOSIT FORM */}
        {view === 'fiat' && (
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <button onClick={() => setView('menu')} className="mb-6 text-gray-400 hover:text-yellow-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Deposit via {fiatCurrency}</h2>
            <form onSubmit={handleFiatSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Transfer Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-[#0B0E11] border border-[#2B3139] text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition-all font-bold">
                  <option value="KPay">KPay (09xxxxxxxxx)</option>
                  <option value="WavePay">WavePay (09xxxxxxxxx)</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Amount (USDT equivalent)</label>
                <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0B0E11] border border-[#2B3139] text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition-all font-bold"/>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Upload Payment Slip</label>
                <input type="file" accept="image/*" onChange={(e) => setSlip(e.target.files[0])} className="w-full bg-[#0B0E11] border border-[#2B3139] text-gray-400 rounded-xl px-4 py-3 text-sm"/>
              </div>
              <div className="pt-4">
                <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-yellow-500 text-black font-black text-xs uppercase tracking-widest hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/20">
                  {isSubmitting ? 'Processing...' : 'Submit Deposit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 🌟 STEP-BY-STEP CRYPTO DEPOSIT */}
        {view === 'crypto' && (
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <button onClick={() => { setView('menu'); setCryptoStep(1); setSelectedCoin(null); setSelectedNetwork(null); }} className="mb-6 text-gray-400 hover:text-yellow-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
            
            <h2 className="text-2xl font-black text-white mb-6">Deposit Crypto</h2>

            <div className="relative border-l-2 border-[#2B3139] ml-3 pl-6 space-y-8 pb-4">
              
              {/* STEP 1: Select Coin */}
              <div className="relative">
                <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${cryptoStep >= 1 ? 'bg-yellow-500 text-black' : 'bg-[#2B3139] text-gray-400'}`}>1</div>
                <h3 className={`text-sm font-bold mb-3 ${cryptoStep >= 1 ? 'text-white' : 'text-gray-500'}`}>Select Coin</h3>
                
                <div className="flex flex-wrap gap-2">
                  {cryptoCoins.map(coin => (
                    <button 
                      key={coin}
                      onClick={() => { setSelectedCoin(coin); setCryptoStep(2); setSelectedNetwork(null); }}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                        selectedCoin === coin 
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' 
                        : 'bg-[#0B0E11] text-gray-400 border border-[#2B3139] hover:bg-[#1E2329]'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: Select Network */}
              <div className={`relative transition-opacity duration-300 ${cryptoStep >= 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${cryptoStep >= 2 ? 'bg-yellow-500 text-black' : 'bg-[#2B3139] text-gray-400'}`}>2</div>
                <h3 className={`text-sm font-bold mb-3 ${cryptoStep >= 2 ? 'text-white' : 'text-gray-500'}`}>Select Network</h3>
                
                {selectedCoin && (
                  <div className="flex flex-wrap gap-2">
                    {networkOptions[selectedCoin]?.map(net => (
                      <button 
                        key={net}
                        onClick={() => { setSelectedNetwork(net); setCryptoStep(3); }}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                          selectedNetwork === net 
                          ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' 
                          : 'bg-[#0B0E11] text-gray-400 border border-[#2B3139] hover:bg-[#1E2329]'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3: Deposit Address */}
              <div className={`relative transition-opacity duration-300 ${cryptoStep >= 3 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${cryptoStep >= 3 ? 'bg-yellow-500 text-black' : 'bg-[#2B3139] text-gray-400'}`}>3</div>
                <h3 className={`text-sm font-bold mb-3 ${cryptoStep >= 3 ? 'text-white' : 'text-gray-500'}`}>Deposit Address</h3>
                
                {cryptoStep === 3 && (
                  <div className="bg-[#0B0E11] p-5 rounded-2xl border border-[#2B3139] animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="bg-white p-2 rounded-xl">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${getMockAddress()}`} alt="QR" className="w-24 h-24"/>
                      </div>
                      <div className="flex-1 w-full overflow-hidden">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Network</p>
                        <p className="text-yellow-500 font-bold text-sm mb-3">{selectedNetwork}</p>
                        
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Address</p>
                        <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139] flex items-center justify-between group overflow-hidden">
                          <span className="text-white font-mono text-xs truncate mr-2">{getMockAddress()}</span>
                          <button onClick={() => showAlert("Address copied!", "success")} className="text-gray-500 hover:text-yellow-500 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DepositModal;