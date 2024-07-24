// src/lib/api-service.ts

import { toast } from 'react-toastify';

const API_BASE_URL = '/api';

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

export const apiService = {
  async requestEmailCode(email: string): Promise<ApiResponse<{
    email: string;
    requestId: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/requestEmailCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email}),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to create wallet');
      return { error: (error as Error).message };
    }
  },

    async verifyEmailCode(data: { email: string; verificationCode: string; requestId: string; alias: string }): Promise<ApiResponse<{ authToken: string }>> {
        try {
        const response = await fetch(`${API_BASE_URL}/verifyEmailCode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleApiResponse(response);
        } catch (error) {
        toast.error('Failed to verify email code');
        return { error: (error as Error).message };
        }
    },

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

  async adminLogin(password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/adminLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to login');
      return { error: (error as Error).message };
    }
  },

  async getUsers(token: string): Promise<ApiResponse<Array<{ email: string; auth_token: string }>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to fetch users');
      return { error: (error as Error).message };
    }
  },

  async deleteUser(email: string, token: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${email}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      toast.error('Failed to delete user');
      return { error: (error as Error).message };
    }
  },
};