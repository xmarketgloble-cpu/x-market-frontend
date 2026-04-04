import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  // 🔥 အမျိုးအစားအလိုက် စစ်ထုတ်ရန် Filter State
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setList(res.data);
      } catch (err) { 
        console.error("Failed to fetch history:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchHistory();
  }, []);

  // Filter Logic: ရွေးချယ်ထားတဲ့ အမျိုးအစားအလိုက် ဒေတာကို စစ်ထုတ်ခြင်း
  const filteredList = filter === 'All' 
    ? list 
    : list.filter(t => filter === 'Trades' ? (t.type === 'Buy' || t.type === 'Sell') : t.type === filter);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center text-yellow-500 font-black tracking-widest uppercase animate-pulse">
      Accessing Secure Ledger...
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto p-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <span className="text-yellow-500">📜</span> Transaction History
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Detailed audit trail of your account activities</p>
        </div>

        {/* 🌟 Filter Tabs UI */}
        <div className="flex bg-[#1E2329] p-1 rounded-xl border border-[#2B3139]">
          {['All', 'Deposit', 'Trades', 'Withdraw'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab ? 'bg-[#2B3139] text-yellow-500 shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B0E11]/50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#2B3139]">
              <tr>
                <th className="px-8 py-5">Time Stamp</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Asset / Pair</th>
                <th className="px-8 py-5 text-right">Amount / Price</th>
                <th className="px-8 py-5 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-24 text-center">
                    <div className="text-gray-600 space-y-3">
                      <span className="text-5xl block opacity-10">📂</span>
                      <p className="font-black uppercase tracking-[0.2em] text-[10px]">No transaction records found in this category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map(t => (
                  <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 text-xs text-gray-400 font-medium whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-widest ${
                        t.type === 'Buy' || t.type === 'Withdraw' 
                        ? 'text-red-400 bg-red-400/10 border border-red-400/20' 
                        : 'text-green-400 bg-green-400/10 border border-green-400/20'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white uppercase">{t.coinId || 'USDT'}</p>
                        {t.type === 'Buy' || t.type === 'Sell' ? (
                          <span className="text-[9px] text-gray-600 font-black tracking-tighter">/ USDT</span>
                        ) : (
                          <span className="text-[9px] text-yellow-500/50 font-black tracking-tighter uppercase">{t.method}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <p className={`font-mono font-bold text-base ${
                          t.type === 'Buy' || t.type === 'Withdraw' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {t.type === 'Buy' || t.type === 'Withdraw' ? '-' : '+'}{t.amount.toFixed(t.type === 'Buy' || t.type === 'Sell' ? 5 : 2)}
                          <span className="text-[10px] ml-1 uppercase">{t.type === 'Buy' || t.type === 'Sell' ? t.coinId : 'USDT'}</span>
                        </p>
                        {t.pricePerCoin > 0 && (
                          <p className="text-[9px] text-gray-500 font-bold mt-1 tracking-widest uppercase">
                            Price: ${t.pricePerCoin.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'Completed' || t.status === 'Approved' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
                          t.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                        }`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          t.status === 'Completed' || t.status === 'Approved' ? 'text-green-500' : 
                          t.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex justify-between items-center text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">
        <p>Data provided by X Market Intelligent Terminal</p>
        <p>© 2026 Audit System</p>
      </div>
    </div>
  );
}

export default TransactionHistory;