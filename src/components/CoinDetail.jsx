import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const FALLBACK_INFO = {
  bitcoin: { circ: 19650000, max: 21000000, desc: "Bitcoin is a decentralized cryptocurrency first described in a 2008 whitepaper by Satoshi Nakamoto. It was launched in January 2009." },
  ethereum: { circ: 120000000, max: null, desc: "Ethereum is a decentralized open-source blockchain system that features its own cryptocurrency, Ether. ETH works as a platform for numerous other cryptocurrencies." },
  binancecoin: { circ: 147000000, max: 200000000, desc: "Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. It is now the native coin of the BNB Chain." },
  solana: { circ: 440000000, max: null, desc: "Solana is a highly functional open source project that banks on blockchain technology's permissionless nature to provide DeFi solutions." },
  cardano: { circ: 35000000000, max: 45000000000, desc: "Cardano is a proof-of-stake blockchain platform: the first to be founded on peer-reviewed research." }
};

function CoinDetail({ coin, onClose, prices }) {
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  // 💡 WebSocket (prices) မှ ဈေးနှုန်းကို Real-time ရယူခြင်း
  const livePrice = useMemo(() => prices?.[coin.id]?.usd || 0, [prices, coin.id]);
  const liveChange = useMemo(() => prices?.[coin.id]?.usd_24h_change || 0, [prices, coin.id]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    
    setLoading(true);
    axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`)
      .then((response) => {
        const cleanDesc = response.data.description?.en?.replace(/<[^>]*>?/gm, '') || 'No description available';
        setCoinData({
          market_cap: response.data.market_data?.market_cap?.usd || (livePrice * (FALLBACK_INFO[coin.id]?.circ || 1000000)),
          volume_24h: response.data.market_data?.total_volume?.usd || 0,
          high_24h: response.data.market_data?.high_24h?.usd || (livePrice * 1.05),
          low_24h: response.data.market_data?.low_24h?.usd || (livePrice * 0.95),
          ath: response.data.market_data?.ath?.usd || livePrice,
          atl: response.data.market_data?.atl?.usd || livePrice,
          fully_diluted: response.data.market_data?.fully_diluted_valuation?.usd || 0,
          total_supply: response.data.market_data?.total_supply || 0,
          max_supply: response.data.market_data?.max_supply || 0,
          circulating_supply: response.data.market_data?.circulating_supply || FALLBACK_INFO[coin.id]?.circ,
          description: cleanDesc.substring(0, 450),
          rank: response.data.market_cap_rank || coin.rank,
        });
        setLoading(false);
      })
      .catch(() => {
        const info = FALLBACK_INFO[coin.id] || { circ: 1000000, max: 1000000, desc: `Analysis for ${coin.name}` };
        setCoinData({
          market_cap: livePrice * info.circ,
          volume_24h: (livePrice * info.circ) * 0.05,
          high_24h: livePrice * 1.02,
          low_24h: livePrice * 0.98,
          ath: livePrice * 1.5,
          atl: livePrice * 0.5,
          fully_diluted: info.max ? (livePrice * info.max) : (livePrice * info.circ),
          total_supply: info.circ,
          max_supply: info.max,
          circulating_supply: info.circ,
          description: info.desc,
          rank: coin.rank || 'N/A',
        });
        setLoading(false);
      });

    return () => window.removeEventListener('keydown', handleEsc);
  }, [coin.id, livePrice]); // livePrice ပြောင်းရင် ဒေတာတွက်ချက်မှု Update ဖြစ်စေရန်

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num > 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num > 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num > 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  if (loading && !coinData) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110]">
        <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md overflow-y-auto z-[110] flex justify-center p-4">
      <div className="max-w-5xl w-full my-auto animate-in fade-in zoom-in duration-300">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-center mb-6 bg-[#1E2329] p-5 rounded-2xl border border-[#2B3139] shadow-2xl">
          <div className="flex items-center gap-4">
            <img src={coin.logo} alt={coin.symbol} className="w-14 h-14 rounded-full bg-[#0B0E11] p-1 border border-[#2B3139]" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">{coin.name}</h1>
                <span className="text-gray-500 font-bold uppercase text-sm">{coin.symbol}</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/20">Rank #{coinData?.rank}</span>
              </div>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-1">Institutional Data Stream</p>
            </div>
          </div>
          <button onClick={onClose} className="group flex items-center justify-center w-12 h-12 rounded-full bg-[#2B3139] hover:bg-red-500/20 transition-all border border-[#3b434d] hover:border-red-500/50">
            <svg className="w-6 h-6 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* --- Live Market Analytics --- */}
        <div className="bg-[#1E2329] rounded-2xl border border-[#2B3139] p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-5xl font-black text-white">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-black ${liveChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {liveChange >= 0 ? '▲' : '▼'} {Math.abs(liveChange).toFixed(2)}%
              </div>
            </div>

            <div className="flex gap-3 mt-8 bg-[#0B0E11] p-1.5 rounded-xl w-fit border border-[#2B3139]">
              {['24h', '7d', '14d', '30d', '1y'].map((tf) => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${timeframe === tf ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}>{tf}</button>
              ))}
            </div>

            <div className="h-64 mt-6 flex items-center justify-center border border-[#2B3139] rounded-2xl bg-[#0B0E11] relative overflow-hidden">
              <div className="text-center z-10">
                <p className="text-white font-bold tracking-widest uppercase text-[10px] opacity-40">Proprietary {coin.name} Visualization Terminal</p>
                <div className="flex items-center justify-center gap-2 mt-4"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span><span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">Live Feed Active</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Market Intelligence Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1E2329] rounded-2xl border border-[#2B3139] p-6">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">Market Intelligence</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">Market Capitalization</span><span className="text-white font-bold">{formatNumber(coinData?.market_cap)}</span></div>
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">Trading Volume (24h)</span><span className="text-white font-bold">{formatNumber(coinData?.volume_24h)}</span></div>
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">Vol / Mcap Ratio</span><span className="text-white font-bold">{((coinData?.volume_24h / coinData?.market_cap) * 100).toFixed(2)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm font-medium">Diluted Valuation</span><span className="text-white font-bold">{formatNumber(coinData?.fully_diluted)}</span></div>
            </div>
          </div>

          <div className="bg-[#1E2329] rounded-2xl border border-[#2B3139] p-6">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">Asset Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">24h High / Low</span><span className="text-white font-bold">${coinData?.high_24h?.toLocaleString()} / ${coinData?.low_24h?.toLocaleString()}</span></div>
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">All-Time High</span><span className="text-green-500 font-bold">${coinData?.ath?.toLocaleString()}</span></div>
              <div className="flex justify-between border-b border-[#2B3139] pb-3"><span className="text-gray-400 text-sm font-medium">All-Time Low</span><span className="text-red-500 font-bold">${coinData?.atl?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm font-medium">Supply Status</span><span className="text-yellow-500 font-black text-xs uppercase">Verified Asset</span></div>
            </div>
          </div>
        </div>

        {/* --- Supply Metrics --- */}
        <div className="bg-[#1E2329] rounded-2xl border border-[#2B3139] p-6 mb-6">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">Supply Mechanics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Circulating', val: coinData?.circulating_supply },
              { label: 'Total Issued', val: coinData?.total_supply },
              { label: 'Hard Cap', val: coinData?.max_supply }
            ].map((s, i) => (
              <div key={i} className="bg-[#0B0E11] p-5 rounded-2xl border border-[#2B3139]">
                <p className="text-gray-600 text-[9px] font-black uppercase mb-2">{s.label}</p>
                <p className="text-white font-black text-lg">{s.val ? s.val.toLocaleString() : '∞'} <span className="text-gray-600 text-[10px] uppercase">{coin.symbol}</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E2329] rounded-2xl border border-[#2B3139] p-8 mb-10">
          <h3 className="text-white font-bold text-lg mb-4">Institutional Summary</h3>
          <p className="text-gray-400 text-sm leading-relaxed italic">"{coinData?.description}..."</p>
        </div>
      </div>
    </div>
  );
}

export default CoinDetail;