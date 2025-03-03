import { User } from "@/types"

// Function to get the user from local storage
export const getUser = (id: string): User | null => {
  const usersJson = localStorage.getItem('users');
  if (!usersJson) return null;

  const users: User[] = JSON.parse(usersJson);
  return users.find(user => user.id === id) || null;
};

// Function to add a new user to local storage
export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

// Function to get all users from local storage
export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

// Function to update user information in local storage
export const updateUser = (updatedUser: User): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === updatedUser.id);

  if (index === -1) {
    console.error('User not found');
    return null;
  }

  users[index] = updatedUser;
  localStorage.setItem('users', JSON.stringify(users));
  return updatedUser;
};

// Function to set the USDT address for a user
export const setUsdtAddress = (usdtAddress: string): User | null => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const user = getUser(userId);
  if (!user) return null;

  user.usdtAddress = usdtAddress;
  updateUser(user);
  return user;
};

// Function to update USDT earnings for a user
export const updateUsdtEarnings = (earnings: number): User | null => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const user = getUser(userId);
  if (!user) return null;

  user.usdtEarnings = earnings;
  updateUser(user);
  return user;
};

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

// Function to create a withdrawal request
export const createWithdrawalRequest = (userId: string, amount: number, address: string): WithdrawalRequest => {
  const withdrawalRequests = getWithdrawalRequests();
  
  const newRequest: WithdrawalRequest = {
    id: Math.random().toString(36).substring(2, 15),
    userId,
    amount,
    address,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  withdrawalRequests.push(newRequest);
  localStorage.setItem('withdrawal_requests', JSON.stringify(withdrawalRequests));
  
  // Deduct the amount from user's USDT earnings
  const user = getUser(userId);
  if (user) {
    user.usdtEarnings -= amount;
    updateUser(user);
  }
  
  return newRequest;
};

// Function to get all withdrawal requests
export const getWithdrawalRequests = (): WithdrawalRequest[] => {
  const requestsJson = localStorage.getItem('withdrawal_requests');
  return requestsJson ? JSON.parse(requestsJson) : [];
};

// Function to update a withdrawal request status
export const updateWithdrawalRequestStatus = (requestId: string, status: 'approved' | 'rejected'): WithdrawalRequest | null => {
  const withdrawalRequests = getWithdrawalRequests();
  const index = withdrawalRequests.findIndex(req => req.id === requestId);
  
  if (index === -1) return null;
  
  withdrawalRequests[index].status = status;
  withdrawalRequests[index].processedAt = Date.now();
  
  localStorage.setItem('withdrawal_requests', JSON.stringify(withdrawalRequests));
  return withdrawalRequests[index];
};
