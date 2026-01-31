import api from './api';

export const authService = {
  login: async (data) => {
    return await api.post('/auth/login', data);
  },
};
