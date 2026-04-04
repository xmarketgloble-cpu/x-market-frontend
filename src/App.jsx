import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import PriceChart from './components/PriceChart';
import CoinDetail from './components/CoinDetail';
import Login from './Login';
import Register from './Register';
import Profile from './components/Profile';
import Admin from './Admin'; 
import AlertModal from './components/AlertModal';
import DepositModal from './components/DepositModal';
// 🔥 အသစ်ဖန်တီးထားသော P2PTrading Component ကို Import လုပ်ပါ
import P2PTrading from './components/P2PTrading';
// 🔥 TransactionHistory Component ကို Import လုပ်ပါ
import TransactionHistory from './components/TransactionHistory';

// Main Dashboard Component
function Dashboard({ 
  prices, searchTerm, setSearchTerm, selectedCoin, setSelectedCoin, 
  globalStats, coins, getCoinData, formatCurrency, formatCompact, 
  user, setUser 
}) {
  const navigate = useNavigate();
  const [balanceCurrency, setBalanceCurrency] = useState('USDT');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'error' });
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  const showAlert = (message, type = 'error') => setAlertConfig({ isOpen: true, message, type });

  // 🔥 Professional Security Logic: KYC စစ်ဆေးရန် Function
  const checkVerification = () => {
    if (!user) {
      showAlert("Please login first!", "error");
      return false;
    }
    if (user.isVerified !== 'Verified') {
      showAlert("KYC Verification Required! Please complete your identity profile to unlock all features.", "error");
      // ၃ စက္ကန့်အကြာတွင် Profile (KYC) page သို့ ပို့ပေးမည်
      setTimeout(() => navigate('/profile'), 2500);
      return false;
    }
    return true;
  };

  const currencyMap = {
    'USDT': 'usdt',
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana'
  };

  const getDisplayedBalance = () => {
    if (balanceCurrency === 'USDT') return parseFloat(user?.balance || 0).toFixed(2);
    const holding = user?.holdings?.find(h => h.coinId === currencyMap[balanceCurrency]);
    return holding ? parseFloat(holding.amount).toFixed(5) : '0.00000';
  };

  const getApproxUsd = () => {
    if (balanceCurrency === 'USDT') return null;
    const holding = user?.holdings?.find(h => h.coinId === currencyMap[balanceCurrency]);
    const amount = holding ? holding.amount : 0;
    const price = prices?.[currencyMap[balanceCurrency]]?.usd || 0;
    return formatCurrency(amount * price);
  };

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const trending = [...coins]
    .map(c => ({ ...c, ...getCoinData(c) }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4);

  const handleQuickBuy = async (coin) => {
    // 🔥 Security Guard
    if (!checkVerification()) return;

    const coinData = getCoinData(coin);
    const amountToSpend = 10; 

    if (user.balance < amountToSpend) return showAlert("Insufficient Balance! Please deposit funds to continue.", "error");

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/buy-coin', 
        { coinId: coin.id, amount: amountToSpend, pricePerCoin: coinData.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, balance: res.data.balance, holdings: res.data.holdings };
      setUser(updatedUser);
      localStorage.setItem('userBalance', res.data.balance);
      
      showAlert(res.data.message, "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Transaction Failed", "error");
    }
  };

  const handleQuickSell = async (coin) => {
    // 🔥 Security Guard
    if (!checkVerification()) return;

    const coinData = getCoinData(coin);
    const userCoin = user?.holdings?.find(h => h.coinId === coin.id);
    
    if (!userCoin || userCoin.amount <= 0) {
      return showAlert(`You don't have any ${coin.symbol} to sell!`, "error");
    }

    const amountToSell = userCoin.amount; 

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/sell-coin', 
        { coinId: coin.id, amount: amountToSell, pricePerCoin: coinData.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, balance: res.data.balance, holdings: res.data.holdings };
      setUser(updatedUser);
      localStorage.setItem('userBalance', res.data.balance);
      
      showAlert(res.data.message, "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Sell Failed", "error");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 relative">
      
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={closeAlert} 
      />

      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
        onDepositSuccess={() => { /* Option to refresh */ }}
        showAlert={showAlert} 
      />

      {/* 🌟 PORTFOLIO CARD */}
      {user && (
        <div className="mb-10 p-8 rounded-3xl border border-[#2B3139] bg-gradient-to-br from-[#1E2329] to-[#0F172A] shadow-2xl relative overflow-visible z-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span> Your Assets
              </p>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 relative">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {getDisplayedBalance()}
                  </h1>
                  
                  <div className="relative mt-2">
                    <button 
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="flex items-center gap-1 text-xl md:text-2xl text-gray-500 font-bold hover:text-yellow-500 transition-colors"
                    >
                      {balanceCurrency}
                      <svg className={`w-5 h-5 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    
                    {showCurrencyDropdown && (
                      <>
                        <div className="fixed inset-0 z-[40]" onClick={() => setShowCurrencyDropdown(false)}></div>
                        <div className="absolute top-full left-0 mt-3 w-40 bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[50] py-2 animate-in fade-in zoom-in-95 duration-200">
                          {Object.keys(currencyMap).map(cur => (
                            <div
                              key={cur}
                              onClick={() => { setBalanceCurrency(cur); setShowCurrencyDropdown(false); }}
                              className={`px-5 py-3 text-sm font-bold cursor-pointer transition-all flex items-center justify-between ${
                                balanceCurrency === cur 
                                ? 'bg-yellow-500/10 text-yellow-500 border-l-4 border-yellow-500' 
                                : 'text-gray-300 hover:bg-[#2B3139] hover:text-white border-l-4 border-transparent'
                              }`}
                            >
                              <span>{cur}</span>
                              {balanceCurrency === cur && <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#EAB308]"></span>}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {balanceCurrency !== 'USDT' && (
                  <p className="text-gray-500 text-sm font-bold mt-2 flex items-center gap-1">
                    ≈ ${getApproxUsd()}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                  user.isVerified === 'Verified' ? 'bg-green-500/20 text-green-500' : 
                  user.isVerified === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {user.isVerified || 'Unverified'}
                </span>
                {user.isVerified !== 'Verified' && (
                  <Link to="/profile" className="text-[9px] text-gray-400 hover:text-white underline font-bold uppercase tracking-widest">Verify Now</Link>
                )}
              </div>
            </div>
            
            <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0">
              {/* 🔥 Deposit ခလုတ်တွင် KYC Logic ထည့်သွင်းထားပါသည် */}
              <button 
                onClick={() => checkVerification() && setIsDepositOpen(true)}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg ${
                  user.isVerified === 'Verified' 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-500/20' 
                  : 'bg-white/5 text-gray-500 border border-white/10'
                }`}
              >
                {user.isVerified === 'Verified' ? 'Deposit' : '🔒 Deposit'}
              </button>
              <button onClick={() => checkVerification()} className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white font-black px-8 py-3.5 rounded-xl border border-white/10 transition text-xs uppercase tracking-widest">Withdraw</button>
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL MARKET OVERVIEW --- */}
      {globalStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
          {[
            { label: 'Market Cap', val: formatCompact(globalStats.total_market_cap), change: '▲ 1.2%' },
            { label: '24h Volume', val: formatCompact(globalStats.total_volume), change: '▼ 5.4%' },
            { label: 'BTC Dominance', val: `${globalStats.btc_dominance.toFixed(1)}%`, change: '▲ 0.1%' },
            { label: 'Network Status', val: 'OPERATIONAL', live: true }
          ].map((s, i) => (
            <div key={i} className="bg-[#1E2329] p-5 rounded-2xl border border-[#2B3139] hover:border-gray-700 transition">
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">{s.label}</p>
              <div className="flex items-center justify-between">
                <p className={`text-xl font-bold ${s.live ? 'text-green-500 flex items-center gap-2' : ''}`}>
                  {s.live && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                  {s.val}
                </p>
                {s.change && <span className={`text-[10px] font-bold ${s.change.includes('▲') ? 'text-green-500' : 'text-red-500'}`}>{s.change}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TRENDING ASSETS --- */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">🔥</span>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Market Movers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.map(c => {
            const data = getCoinData(c);
            return (
            <div key={c.id} className="bg-[#1E2329] p-5 rounded-2xl border border-[#2B3139] hover:bg-[#252a31] transition-all cursor-pointer group" onClick={() => setSelectedCoin(c)}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <img src={c.logo} className="w-6 h-6" alt="" />
                  <span className="font-black text-sm">{c.symbol}</span>
                </div>
                {data.isLoading ? (
                  <div className="h-5 w-12 bg-[#2B3139] rounded animate-pulse"></div>
                ) : (
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${data.change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                  </span>
                )}
              </div>
              {data.isLoading ? (
                  <div className="h-8 w-24 bg-[#2B3139] rounded animate-pulse mt-1"></div>
              ) : (
                  <p className="text-2xl font-bold group-hover:text-yellow-500 transition">${formatCurrency(data.price)}</p>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* --- ASSETS TABLE --- */}
      <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B0E11]/50 text-gray-500 text-[10px] uppercase tracking-[0.15em] font-black">
              <tr>
                <th className="px-8 py-5">Asset Intelligence</th>
                <th className="px-8 py-5 text-right">Last Price</th>
                <th className="px-8 py-5 text-right">24h Variance</th>
                <th className="px-8 py-5 text-right hidden md:table-cell">Market Cap</th>
                <th className="px-8 py-5 text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {filteredCoins.map(c => {
                const data = getCoinData(c);
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 flex items-center gap-4 cursor-pointer" onClick={() => setSelectedCoin(c)}>
                      <img src={c.logo} className="w-10 h-10 rounded-full" alt="" />
                      <div>
                        <p className="font-bold text-white group-hover:text-yellow-500 transition">{c.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">{c.symbol}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-black text-lg text-white cursor-pointer" onClick={() => setSelectedCoin(c)}>
                      {data.isLoading ? (
                        <div className="h-6 w-24 bg-[#2B3139] rounded animate-pulse ml-auto"></div>
                      ) : (
                        `$${formatCurrency(data.price)}`
                      )}
                    </td>
                    <td className={`px-8 py-6 text-right font-black cursor-pointer ${data.isLoading ? '' : (data.change >= 0 ? 'text-green-500' : 'text-red-500')}`} onClick={() => setSelectedCoin(c)}>
                      {data.isLoading ? (
                        <div className="h-6 w-16 bg-[#2B3139] rounded animate-pulse ml-auto"></div>
                      ) : (
                        <>{data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%</>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right text-gray-400 font-medium text-sm hidden md:table-cell cursor-pointer" onClick={() => setSelectedCoin(c)}>
                      {data.isLoading ? (
                        <div className="h-6 w-20 bg-[#2B3139] rounded animate-pulse ml-auto"></div>
                      ) : (
                        formatCompact(data.price * 19500000)
                      )}
                    </td>
                    <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleQuickBuy(c)}
                        className="bg-white/5 hover:bg-yellow-500 text-white hover:text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Buy
                      </button>
                      <button 
                        onClick={() => handleQuickSell(c)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 bg-[#1E2329] p-8 rounded-3xl border border-[#2B3139] relative z-10">
        <PriceChart 
          coin={selectedCoin || coins[0]} 
          price={getCoinData(selectedCoin || coins[0]).price} 
          change={getCoinData(selectedCoin || coins[0]).change}
        />
      </div>
      
      {selectedCoin && <CoinDetail coin={selectedCoin} onClose={() => setSelectedCoin(null)} prices={prices} />}
    </div>
  );
}

// Main App Component
function App() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const coins = useMemo(() => [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', rank: 1, color: '#F7931A', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', rank: 2, color: '#627EEA', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB', rank: 3, color: '#F3BA2F', logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', rank: 4, color: '#00FFA3', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', rank: 5, color: '#0033AD', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' }
  ], []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const balance = localStorage.getItem('userBalance');
    const role = localStorage.getItem('userRole'); 
    const verifiedStatus = localStorage.getItem('isVerified'); 
    
    if (email) {
      setUser({ 
        email, 
        balance: parseFloat(balance || 0), 
        isVerified: verifiedStatus || 'Unverified', 
        role: role || 'user' 
      });
    }

    const syncUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
          localStorage.setItem('userEmail', res.data.email);
          localStorage.setItem('userBalance', res.data.balance);
          localStorage.setItem('userRole', res.data.role);
          localStorage.setItem('isVerified', res.data.isVerified);
        } catch (err) {
          console.error("Session expired or invalid token.");
          localStorage.clear(); 
          setUser(null);
        }
      }
    };
    syncUserData();

    const fetchData = async () => {
      try {
        const [priceRes, globalRes] = await Promise.all([
          axios.get('http://localhost:5000/api/crypto-prices'),
          axios.get('https://api.coingecko.com/api/v3/global')
        ]);
        setPrices(priceRes.data);
        setGlobalStats({
          total_market_cap: globalRes.data.data.total_market_cap.usd,
          total_volume: globalRes.data.data.total_volume.usd,
          btc_dominance: globalRes.data.data.market_cap_percentage.btc,
          active_coins: globalRes.data.data.active_cryptocurrencies
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const streams = 'btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker/solusdt@ticker/adausdt@ticker';
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbolMap = { 'BTCUSDT': 'bitcoin', 'ETHUSDT': 'ethereum', 'BNBUSDT': 'binancecoin', 'SOLUSDT': 'solana', 'ADAUSDT': 'cardano' };
      const coinId = symbolMap[data.s];
      if (coinId) {
        setPrices(prev => {
          if (!prev) return prev;
          return { ...prev, [coinId]: { usd: parseFloat(data.c), usd_24h_change: parseFloat(data.P) } };
        });
      }
    };
    return () => ws.close();
  }, []);

  const getCoinData = (coin) => {
    const price = prices?.[coin.id]?.usd;
    const change = prices?.[coin.id]?.usd_24h_change;
    return { price: price || 0, change: change || 0, isLoading: !price };
  };

  const formatCurrency = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatCompact = (num) => {
    if (!num) return '$0';
    if (num > 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num > 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    return `$${num.toLocaleString()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userBalance');
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('isVerified'); 
    setUser(null);
    window.location.reload();
  };

  if (loading && !prices) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-yellow-500 font-black tracking-widest uppercase italic">Terminal Initializing...</div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-[#0F172A] text-white">
        <nav className="bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#2B3139] sticky top-0 z-[100]">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-500/10">X</div>
                <span className="font-bold text-xl tracking-tighter">X Market</span>
              </Link>
              <div className="hidden lg:flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {['Markets', 'Trade', 'Futures', 'Earn'].map(m => (
                  <a key={m} href="#" className="hover:text-yellow-500 transition-colors">{m}</a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative group hidden sm:block">
                <input 
                  type="text" placeholder="Search Assets" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1E2329] rounded-lg pl-4 pr-4 py-2 w-48 lg:w-64 border border-[#2B3139] focus:border-yellow-500 outline-none text-[10px] transition-all"
                />
              </div>
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full bg-[#1E2329] border-2 border-[#2B3139] hover:border-yellow-500 flex items-center justify-center text-yellow-500 font-bold transition-all shadow-lg shadow-black/50"
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#1E2329] border border-[#2B3139] rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="px-5 py-4 border-b border-[#2B3139] bg-[#0B0E11]/50">
                        <p className="text-sm text-white font-bold truncate">{user.email}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1 ${
                          user.isVerified === 'Verified' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            user.isVerified === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span> {user.isVerified}
                        </p>
                      </div>
                      <div className="p-2">
                        {user.email === 'ohtetpaing969@gmail.com' && user.role === 'admin' && (
                           <Link to="/admin-panel" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition font-black italic">
                             <span>👑</span> Admin Control
                           </Link>
                        )}
                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#2B3139] hover:text-white rounded-xl transition"><span>💳</span> Wallet Balance</a>
                        
                        <Link to="/history" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#2B3139] hover:text-white rounded-xl transition">
                          <span>📜</span> Transaction History
                        </Link>

                        <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#2B3139] hover:text-white rounded-xl transition"><span>👤</span> My Identity (KYC)</Link>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#2B3139] hover:text-white rounded-xl transition"><span>⚙️</span> Security Settings</a>
                      </div>
                      <div className="p-2 border-t border-[#2B3139]">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 font-bold rounded-xl transition"><span>🚪</span> Secure Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-[10px] font-black hover:text-yellow-500 uppercase tracking-widest">Log In</Link>
                  <Link to="/register" className="bg-yellow-500 text-black px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Establish Account</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <Dashboard 
              prices={prices} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin}
              globalStats={globalStats} coins={coins} getCoinData={getCoinData}
              formatCurrency={formatCurrency} formatCompact={formatCompact}
              user={user} setUser={setUser}
            />
          } />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          
          {/* 🔥 Protect P2P Route */}
          <Route path="/p2p" element={
            user?.isVerified === 'Verified' ? <P2PTrading /> : <Navigate to="/profile" replace />
          } />
          
          {/* 🔥 Protect History Route */}
          <Route path="/history" element={
            user?.isVerified === 'Verified' ? <TransactionHistory /> : <Navigate to="/profile" replace />
          } />

          <Route 
            path="/admin-panel" 
            element={
              user?.email === 'ohtetpaing969@gmail.com' && user?.role === 'admin' 
              ? <Admin /> 
              : <Navigate to="/" /> 
            } 
          />

          <Route path="/login" element={<Login setUser={setUser} />} /> 
          <Route path="/register" element={<Register />} />
        </Routes>

        <footer className="max-w-[1400px] mx-auto px-6 py-12 border-t border-[#2B3139] mt-12">
           <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] text-center md:text-left">© 2026 X Market Intelligent Terminal System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;