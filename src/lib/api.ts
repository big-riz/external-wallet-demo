import { toast } from 'react-toastify';
import { Types } from '@handcash/handcash-sdk';
import { User } from '@/lib/auth-context';

const API_BASE_URL = '/api';
const ADMIN_API_BASE_URL = '/api/admin';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return { data: await response.json() };
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const apiService = {

  async checkAliasAvailability(alias: string): Promise<ApiResponse<{ isAvailable: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/aliasAvailability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias }),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to check alias availability');
      return { error: (error as Error).message };
    }
  },

  async requestEmailCode(token: string): Promise<ApiResponse<{
    requestId: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/requestEmailCode`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to request email code');
      return { error: (error as Error).message };
    }
  },

  async verifyEmailCode(token: string, data: { verificationCode: string; requestId: string }): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/verifyEmailCode`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to verify email code');
      return { error: (error as Error).message };
    }
  },

  async getUser(token: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch user data');
      return { error: (error as Error).message };
    }
  },

  async createWallet(token: string, alias: string): Promise<ApiResponse<Types.DepositInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/createWallet`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ alias }),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to create account');
      return { error: (error as Error).message };
    }
  },

  async getUserBalances(token: string): Promise<ApiResponse<Array<Types.UserBalance>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/userBalance`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch user balance');
      return { error: (error as Error).message };
    }
  },

  async getDepositInfo(token: string): Promise<ApiResponse<Types.DepositInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/depositInfo`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch deposit info');
      return { error: (error as Error).message };
    }
  },

  async getTransactionHistory(token: string): Promise<ApiResponse<Array<Types.PaymentResult>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactionHistory`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch transaction history');
      return { error: (error as Error).message };
    }
  },

  async getUsers(token: string): Promise<ApiResponse<Array<{ email: string; auth_token: string }>>> {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch users');
      return { error: (error as Error).message };
    }
  },

  async deleteUser(email: string, token: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/users/${email}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to delete user');
      return { error: (error as Error).message };
    }
  },
};