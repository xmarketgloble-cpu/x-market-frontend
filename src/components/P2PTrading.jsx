import React, { useState } from 'react';

function P2PTrading() {
  const [tradeType, setTradeType] = useState('Buy');

  // Mock Data for P2P Merchants
  const merchants = [
    {
      id: 1,
      name: 'EliteCapital',
      isPromoted: true,
      orders: 1443,
      completion: 99.50,
      likes: '98.72%',
      time: '15 min',
      price: 1.100,
      available: '916.07',
      limit: '10.00 USD - 1,007.00 USD',
      payments: ['Banco Guayaquil', 'Banco del pacifico', 'Produbanco']
    },
    {
      id: 2,
      name: 'Issam_FattouhCryp',
      isPromoted: false,
      orders: 117,
      completion: 78.00,
      likes: '95.71%',
      time: '15 min',
      price: 0.997,
      available: '1,026.88',
      limit: '20.00 USD - 1,023.00 USD',
      payments: ['Bank of Georgia']
    },
    {
      id: 3,
      name: 'Iriska7r',
      isPromoted: false,
      orders: 2118,
      completion: 99.80,
      likes: '99.9%',
      time: '15 min',
      price: 0.998,
      available: '103,791.93',
      limit: '150.00 USD - 24,000.00 USD',
      payments: ['Bank of Georgia']
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 animate-in fade-in duration-500">
      
      {/* Header & Navigation */}
      <div className="flex items-center gap-6 border-b border-[#2B3139] pb-4 mb-6">
        <h1 className="text-xl font-black text-white cursor-pointer hover:text-yellow-500 transition">Express</h1>
        <h1 className="text-xl font-black text-yellow-500 border-b-2 border-yellow-500 pb-4 -mb-[18px] cursor-pointer">P2P</h1>
        <h1 className="text-xl font-black text-white cursor-pointer hover:text-yellow-500 transition">Block</h1>
      </div>

      {/* Trade Controls (Buy/Sell, Filters) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-[#1E2329] rounded-lg p-1">
            <button 
              onClick={() => setTradeType('Buy')} 
              className={`px-8 py-2 rounded-md font-bold text-sm transition ${tradeType === 'Buy' ? 'bg-[#2B3139] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Buy
            </button>
            <button 
              onClick={() => setTradeType('Sell')} 
              className={`px-8 py-2 rounded-md font-bold text-sm transition ${tradeType === 'Sell' ? 'bg-[#2B3139] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Sell
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="text-yellow-500 cursor-pointer">USDT <span className="text-[10px] text-green-500 font-normal">3.81% APR</span></span>
            {['BTC', 'USDC', 'FDUSD', 'BNB', 'ETH', 'DAI'].map(coin => (
              <span key={coin} className="text-gray-400 cursor-pointer hover:text-white transition">{coin}</span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#1E2329] border border-[#2B3139] rounded-lg px-3 py-2">
            <input type="text" placeholder="Transaction amount" className="bg-transparent text-sm text-white outline-none w-40" />
            <div className="border-l border-[#2B3139] pl-3 ml-2 flex items-center gap-1 cursor-pointer">
              <span className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-black">$</span>
              <span className="text-white text-sm font-bold">USD</span>
            </div>
          </div>
          <select className="bg-[#1E2329] border border-[#2B3139] text-white text-sm font-bold rounded-lg px-4 py-2.5 outline-none">
            <option>All payment methods</option>
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 mb-4 px-4">
        <div>Advertisers</div>
        <div>Price</div>
        <div>Available/Order Limit</div>
        <div>Payment</div>
      </div>

      {/* Merchant List */}
      <div className="space-y-4">
        {merchants.map((m, index) => (
          <div key={m.id} className={`bg-[#1E2329] rounded-2xl p-6 border transition hover:border-gray-500 ${m.isPromoted ? 'border-yellow-500/50 relative' : 'border-[#2B3139]'}`}>
            {m.isPromoted && <div className="absolute top-0 left-6 -translate-y-1/2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Promoted Ad</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Advertiser Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xs">{m.name.charAt(0)}</div>
                  <span className="text-white font-bold">{m.name}</span>
                  <span className="text-yellow-500">✓</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{m.orders} orders</span>
                  <span className="border-l border-gray-600 pl-2">{m.completion}% completion</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span>👍 {m.likes}</span>
                  <span>⏱ {m.time}</span>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="text-2xl font-black text-white">$ {m.price.toFixed(3)}</div>
              </div>

              {/* Limits */}
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between max-w-[200px]"><span>Available</span> <span className="text-white font-bold">{m.available} USDT</span></div>
                <div className="flex justify-between max-w-[200px]"><span>Limit</span> <span className="text-white font-bold">{m.limit}</span></div>
              </div>

              {/* Payment & Button */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {m.payments.map((pay, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                      <div className={`w-1 h-3 rounded-full ${i===0 ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
                      {pay}
                    </div>
                  ))}
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-green-500/20">
                  Buy USDT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default P2PTrading;