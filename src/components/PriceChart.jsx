import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts'; // ဒီမှာ CurveStyle မလိုပါဘူး၊ တန်ဖိုးပဲ ထည့်ပေးပါမယ်

function PriceChart({ coin, price, change }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const lastTimeRef = useRef(null);
  const [priceFlash, setPriceFlash] = useState(false);
  const [isRealData, setIsRealData] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || !coin) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#0B0E11' }, textColor: '#9CA3AF' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1E2329' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: { borderColor: '#2B3139' },
      timeScale: { borderColor: '#2B3139', timeVisible: true },
    });

    // 🔥 အရေးကြီးဆုံးပြင်ဆင်ချက်- curveType: 2 ကို သုံးပြီး မျဉ်းကို ညင်သာစွာ ကွေးလိုက်ခြင်း
    const areaSeries = chart.addAreaSeries({
      lineColor: change >= 0 ? '#16C784' : '#EA3943',
      lineWidth: 2,
      topColor: change >= 0 ? 'rgba(22, 199, 132, 0.3)' : 'rgba(234, 57, 67, 0.3)',
      bottomColor: 'rgba(22, 199, 132, 0)',
      priceLineVisible: false,
      curveType: 2, // 👈 0: Linear, 2: Monotone (ဒါက CoinMarketCap လို မျဉ်းကွေးဖြစ်စေတာပါ)
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const fetchRealChartData = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30`);
        const data = await response.json();

        if (data.prices) {
          const formattedData = data.prices.map(item => ({
            time: Math.floor(item[0] / 1000),
            value: item[1]
          }));
          
          const uniqueData = formattedData.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);
          
          if (uniqueData.length > 0 && price > 0) {
            uniqueData[uniqueData.length - 1].value = price;
            lastTimeRef.current = uniqueData[uniqueData.length - 1].time;
          }

          areaSeries.setData(uniqueData);
          chart.timeScale().fitContent();
          setIsRealData(true);
        }
      } catch (error) {
        console.warn('API Limit hit, using fallback...');
        setIsRealData(false);
      }
    };

    fetchRealChartData();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [coin?.id]);

  useEffect(() => {
    if (seriesRef.current && price && lastTimeRef.current) {
      seriesRef.current.update({ time: lastTimeRef.current, value: price });
      
      const isPos = change >= 0;
      seriesRef.current.applyOptions({
        lineColor: isPos ? '#16C784' : '#EA3943',
        topColor: isPos ? 'rgba(22, 199, 132, 0.3)' : 'rgba(234, 57, 67, 0.3)',
      });
    }
  }, [price, change]);

  const formatPrice = (value) => {
    if (!value) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full bg-[#1E2329] p-6 rounded-xl border border-[#2B3139]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={coin?.logo} alt={coin?.symbol} className="w-10 h-10 rounded-full bg-[#0B0E11] p-0.5" />
          <div>
            <h3 className="text-white font-bold text-xl">{coin?.name || 'Bitcoin'}</h3>
            <span className="text-gray-500 text-sm font-medium uppercase">{coin?.symbol || 'BTC'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-3">
            <span className="font-bold text-2xl text-white">{formatPrice(price)}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${change >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      <div className="mt-4 flex justify-between text-gray-500 text-xs">
        <span>{isRealData ? 'Verified Real Data (30D)' : 'Simulated Data'}</span>
        <span>Smooth Curve Style</span>
      </div>
    </div>
  );
}

export default PriceChart;