import api from './api';

export function updateProfile(data) {
  return api.put('/auth/profile', data);
}
