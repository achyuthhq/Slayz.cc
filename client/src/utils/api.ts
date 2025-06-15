
import axios from 'axios';

export const apiRequest = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export const queryClient = {
  invalidateQueries: (key: string[]) => {
    // Implement cache invalidation logic if needed
  }
};
