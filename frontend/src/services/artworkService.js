import api from './api';

export function fetchMarketplace(params = {}) {
  return api.get('/artworks/explore', { params });
}

export function getArtworks() {
  return api.get('/artworks/explore');
}

export function searchArtworks(params) {
  return api.get('/artworks/search', { params });
}

export function createArtwork(data) {
  return api.post('/artworks', data);
}

export function updateArtwork(id, data) {
  return api.put(`/artworks/${id}`, data);
}

export function deleteArtwork(id) {
  return api.delete(`/artworks/${id}`);
}

export function updateArtworkStatus(id, newStatus) {
  return api.put(`/artworks/${id}/status`, null, {
    params: { newStatus }
  });
}

export function toggleLike(id) {
  return api.post(`/artworks/${id}/like`);
}

export function recordView(id) {
  return api.post(`/artworks/${id}/view`);
}

export function getTrending() {
  return api.get('/artworks/trending');
}

export function getMostLiked() {
  return api.get('/artworks/most-liked');
}