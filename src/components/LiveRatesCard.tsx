
import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DMI_COIN_VALUE } from '@/data/miningPlans';

interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
}

const LiveRatesCard: React.FC = () => {
  const [cryptoRates, setCryptoRates] = useState<CryptoRate[]>([
    {
      symbol: 'DMI',
      name: 'DMI Coin',
      price: DMI_COIN_VALUE,
      change24h: 0.5, // positive change
      icon: <Coins className="h-5 w-5" />
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 0,
      change24h: 0,
      icon: <Coins className="h-5 w-5" />
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 0,
      change24h: 0,
      icon: <Coins className="h-5 w-5" />
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 0,
      change24h: 0,
      icon: <Coins className="h-5 w-5" />
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBinanceRates = async () => {
    try {
      // Fetch data for BTC/USDT, ETH/USDT and BNB/USDT
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
      const responses = await Promise.all(
        symbols.map(symbol => 
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
            .then(res => res.json())
        )
      );
      
      // Also fetch 24h price change percent for calculations
      setLastUpdated(new Date());
      
      // Update state with the new data
      setCryptoRates(prevRates => {
        const newRates = [...prevRates];
        
        // Map the API responses to our crypto rates
        responses.forEach(response => {
          const symbol = response.symbol.replace('USDT', '');
          const index = newRates.findIndex(rate => rate.symbol === symbol);
          
          if (index !== -1) {
            newRates[index] = {
              ...newRates[index],
              price: parseFloat(response.lastPrice),
              change24h: parseFloat(response.priceChangePercent)
            };
          }
        });
        
        return newRates;
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Binance rates:', error);
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and periodically after that
  useEffect(() => {
    // Initial fetch
    fetchBinanceRates();
    
    // Set up interval to fetch every 30 seconds
    const intervalId = setInterval(fetchBinanceRates, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Live Rates</h3>
            <p className="text-sm text-gray-500 mt-1">
              Current cryptocurrency market rates
            </p>
          </div>
          <div className="bg-green-500/10 text-green-600 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-dmi border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cryptoRates.map((crypto) => (
                <div key={crypto.symbol} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${crypto.symbol === 'DMI' ? 'bg-dmi/10 text-dmi' : 'bg-gray-100'}`}>
                      {crypto.icon}
                    </div>
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-xs text-gray-500">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${crypto.price.toLocaleString('en-US', { minimumFractionDigits: crypto.symbol === 'DMI' ? 4 : 2, maximumFractionDigits: crypto.symbol === 'DMI' ? 4 : 2 })}</p>
                    <div className={`text-xs flex items-center justify-end ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {crypto.change24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(crypto.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-center text-gray-500">
          {lastUpdated ? (
            <>Rates updated from Binance at {lastUpdated.toLocaleTimeString()}</>
          ) : (
            <>Rates updated from Binance exchange</>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRatesCard;
