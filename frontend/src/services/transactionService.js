import api from './api';

export function getMyTransactions() {
  return api.get('/transactions/my-vault');
}

export function purchaseArtwork(artworkId) {
  return api.post('/transactions/purchase', null, {
    params: { artworkId },
  });
}

export function getWishlist() {
  return api.get('/social/wishlist');
}

export function toggleWishlist(artworkId) {
  return api.post(`/social/wishlist/${artworkId}`);
}

export function toggleFollow(portfolioId) {
  return api.post(`/social/follow/${portfolioId}`);
}

export function getFollowStatus(portfolioId) {
  return api.get(`/social/follow/${portfolioId}/status`);
}
