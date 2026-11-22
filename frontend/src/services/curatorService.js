import api from './api';

export function getPlatformTransactions() {
  return api.get('/transactions/platform');
}

export function resetPlatform() {
  return api.post('/transactions/platform/reset');
}

export function updateArtworkStatus(id, newStatus) {
  return api.put(`/artworks/${id}/status`, null, { params: { newStatus } });
}

export function getModerationListings() {
  return api.get('/artworks/moderation');
}
