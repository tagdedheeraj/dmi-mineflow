
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface NewsItem {
  title: string;
  url: string;
  imageUrl?: string;
  description: string;
  publishedAt: string;
  source: string;
}

const CryptoNewsCard: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using CryptoCompare News API - this is for demo purposes
      // In a production app, you'd use your own API key
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Cryptocurrency,Mining&excludeCategories=Sponsored');
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto news');
      }
      
      const data = await response.json();
      
      if (data.Data && Array.isArray(data.Data)) {
        // Transform the data to our format
        const formattedNews: NewsItem[] = data.Data.slice(0, 5).map((item: any) => ({
          title: item.title,
          url: item.url,
          imageUrl: item.imageurl,
          description: item.body.length > 150 ? item.body.substring(0, 150) + '...' : item.body,
          publishedAt: new Date(item.published_on * 1000).toISOString(),
          source: item.source,
        }));
        
        setNews(formattedNews);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (err) {
      console.error('Error fetching crypto news:', err);
      setError('Could not load crypto news. Please try again later.');
      
      // Set demo data for fallback if API fails
      setDemoData();
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback demo data in case API fails
  const setDemoData = () => {
    const currentDate = new Date();
    const demoNews: NewsItem[] = [
      {
        title: 'Bitcoin Crosses $84,000 as Institutional Investors Pour In',
        url: '#',
        description: 'Bitcoin has reached a new all-time high as major institutional investors continue to accumulate the leading cryptocurrency...',
        publishedAt: new Date(currentDate.setHours(currentDate.getHours() - 2)).toISOString(),
        source: 'CryptoNews'
      },
      {
        title: 'Ethereum Mainnet Upgrade Scheduled for Next Month',
        url: '#',
        description: 'The Ethereum foundation has announced the next major upgrade to the Ethereum mainnet, promising improved scalability and lower gas fees...',
        publishedAt: new Date(currentDate.setHours(currentDate.getHours() - 5)).toISOString(),
        source: 'ETHWorld'
      },
      {
        title: 'DMI Network Preparing for Mainnet Launch in 2025',
        url: '#',
        description: 'The DMI Network is finalizing preparations for its mainnet launch scheduled for late 2025, with significant improvements to its mining protocol...',
        publishedAt: new Date(currentDate.setHours(currentDate.getHours() - 8)).toISOString(),
        source: 'DMI Blog'
      },
      {
        title: 'New Regulatory Framework for Cryptocurrency Mining Proposed',
        url: '#',
        description: 'Lawmakers have introduced a new bill that would establish a clear regulatory framework for cryptocurrency mining operations...',
        publishedAt: new Date(currentDate.setHours(currentDate.getHours() - 12)).toISOString(),
        source: 'CryptoPolicyWatch'
      },
      {
        title: 'Green Mining Solutions Gain Traction Among Major Crypto Firms',
        url: '#',
        description: 'Several leading cryptocurrency mining operations are transitioning to renewable energy sources amid growing environmental concerns...',
        publishedAt: new Date(currentDate.setHours(currentDate.getHours() - 24)).toISOString(),
        source: 'GreenTechToday'
      }
    ];
    
    setNews(demoNews);
    setLastUpdated(new Date());
  };

  // Fetch news on component mount and set up interval to refresh every 30 minutes
  useEffect(() => {
    fetchNews();
    
    const intervalId = setInterval(() => {
      fetchNews();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  return (
    <Card className="overflow-hidden border border-gray-100 shadow-md animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">Crypto News</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Latest cryptocurrency updates and market news
            </CardDescription>
          </div>
          <div className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
            <Newspaper className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-dmi border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" onClick={handleRefresh} className="mx-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div 
                key={index} 
                className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 rounded-md transition-colors p-2 -mx-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{item.source}</span>
                    <span>{formatDate(new Date(item.publishedAt))}</span>
                  </div>
                </a>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
              <span>
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="text-xs h-7 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoNewsCard;
