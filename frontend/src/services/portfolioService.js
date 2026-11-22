import api from './api';

export function getMyPortfolio() {
  return api.get('/portfolios/me');
}

export function updateMyPortfolio(data) {
  return api.put('/portfolios/me', data);
}
