
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
  // Mock data for crypto rates
  // In a real app, you would fetch this from an API
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
      price: 61432.89,
      change24h: 2.3, // positive change
      icon: <Coins className="h-5 w-5" />
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3289.45,
      change24h: -1.2, // negative change
      icon: <Coins className="h-5 w-5" />
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 574.65,
      change24h: 1.8, // positive change
      icon: <Coins className="h-5 w-5" />
    }
  ]);

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
                    {Math.abs(crypto.change24h)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-center text-gray-500">
          Rates updated from Binance exchange
        </div>
      </div>
    </div>
  );
};

export default LiveRatesCard;
