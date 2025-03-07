import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  ArrowUpToLine, 
  History, 
  Landmark, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { DmiBalanceCard } from '@/components/DmiBalanceCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PaymentModal from '@/components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import BottomBar from '@/components/BottomBar';
import useMobile from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { getUser, updateUserBalance } from '@/lib/storage';
import RewardsTrackingCard from '@/components/rewards/RewardsTrackingCard';
import { getUsdtTransactions, getDmiTransactions } from '@/lib/transactions';

const Wallet: React.FC = () => {
  const [user, setUser] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Redirect to login if no user is found
        navigate('/login');
      }
    };
    
    fetchUser();
  }, [navigate]);
  
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        // Fetch both USDT and DMI transactions
        const usdtTransactions = await getUsdtTransactions(user?.id);
        const dmiTransactions = await getDmiTransactions(user?.id);
        
        // Combine and sort transactions by timestamp
        const allTransactions = [...(usdtTransactions || []), ...(dmiTransactions || [])].sort((a: any, b: any) => b.timestamp - a.timestamp);
        
        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transaction history."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadTransactions();
    }
  }, [user, toast]);
  
  const refreshTransactions = async () => {
    setIsLoading(true);
    try {
      // Fetch both USDT and DMI transactions
      const usdtTransactions = await getUsdtTransactions(user?.id);
      const dmiTransactions = await getDmiTransactions(user?.id);
      
      // Combine and sort transactions by timestamp
      const allTransactions = [...(usdtTransactions || []), ...(dmiTransactions || [])].sort((a: any, b: any) => b.timestamp - a.timestamp);
      
      setTransactions(allTransactions);
      toast({
        title: "Transactions Refreshed",
        description: "Your transaction history has been updated."
      });
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh transaction history."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredTransactions = (type: string) => {
    if (type === 'all') {
      return transactions;
    } else {
      return transactions.filter((transaction: any) => transaction.type === type);
    }
  };
  
  const getTransactionDescription = (transaction: any) => {
    if (transaction.description) {
      return transaction.description;
    } else if (transaction.type === 'deposit') {
      return 'DMI Deposit';
    } else if (transaction.type === 'withdrawal') {
      return 'DMI Withdrawal';
    } else {
      return 'Transaction';
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        title="Wallet"
        icon={<WalletIcon className="h-5 w-5 mr-2 text-dmi" />}
        showBackButton={false}
      />
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20">
        <DmiBalanceCard 
          balance={user?.balance || 0} 
          usdtEarnings={user?.usdtEarnings || 0}
          usdtAddress={user?.usdtAddress}
        />
        
        {/* Add Rewards Tracking Card here */}
        <div className="mt-6">
          <RewardsTrackingCard />
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center justify-center py-6 border-dashed border-gray-300"
            onClick={() => setShowDepositModal(true)}
          >
            <ArrowDownToLine className="mr-2 h-5 w-5 text-green-600" />
            <span>Deposit</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center py-6 border-dashed border-gray-300"
            onClick={() => setShowWithdrawModal(true)}
          >
            <ArrowUpToLine className="mr-2 h-5 w-5 text-blue-600" />
            <span>Withdraw</span>
          </Button>
        </div>
        
        {/* Transaction history section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={refreshTransactions}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <p>Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <ul className="space-y-2">
                  {transactions.map((transaction: any, index: number) => (
                    <li key={index} className="bg-white rounded-lg shadow-sm p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{getTransactionDescription(transaction)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'} {transaction.amount} {transaction.currency || 'DMI'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            
            <TabsContent value="deposits">
              {isLoading ? (
                <p>Loading deposits...</p>
              ) : filteredTransactions('deposit').length === 0 ? (
                <p>No deposits found.</p>
              ) : (
                <ul className="space-y-2">
                  {filteredTransactions('deposit').map((transaction: any, index: number) => (
                    <li key={index} className="bg-white rounded-lg shadow-sm p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{getTransactionDescription(transaction)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="font-bold text-green-600">
                          +{transaction.amount} {transaction.currency || 'DMI'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            
            <TabsContent value="withdrawals">
              {isLoading ? (
                <p>Loading withdrawals...</p>
              ) : filteredTransactions('withdrawal').length === 0 ? (
                <p>No withdrawals found.</p>
              ) : (
                <ul className="space-y-2">
                  {filteredTransactions('withdrawal').map((transaction: any, index: number) => (
                    <li key={index} className="bg-white rounded-lg shadow-sm p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{getTransactionDescription(transaction)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="font-bold text-red-600">
                          -{transaction.amount} {transaction.currency || 'DMI'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Additional wallet info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Wallet Information</h3>
          <p className="text-sm text-gray-500">
            <span className="font-bold">Important:</span> Keep your wallet information secure.
            Do not share your private keys or seed phrase with anyone.
          </p>
          <Button 
            variant="link" 
            className="mt-4 text-sm"
            onClick={() => {
              if (isMobile) {
                window.location.href = 'https://dminetwork.us/faq';
              } else {
                window.open('https://dminetwork.us/faq', '_blank');
              }
            }}
          >
            Learn More <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            <Landmark className="inline-block h-3 w-3 mr-1 align-middle" />
            DMI Network, Inc.
          </p>
        </div>
      </main>
      
      <BottomBar />
      
      {/* Modals */}
      <PaymentModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        type="deposit"
        userData={user}
      />
      
      <PaymentModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        type="withdraw"
        userData={user}
      />
    </div>
  );
};

export default Wallet;
