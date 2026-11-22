import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as transactionService from '../../services/transactionService';
import { showToast } from '../../store/slices/uiSlice';
import ArtworkCard from './ArtworkCard';
import ArtworkDetailModal from './ArtworkDetailModal';
import { SEED_ARTWORKS } from '../../data/seedArtworks';
import { BookmarkIcon } from '../common/Icons';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const accountId = useSelector((state) => state.auth?.accountid || state.auth?.accountId);
  const auth = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    const savedIds = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]')
      .map(Number);
    const demoItems = SEED_ARTWORKS.filter((item) => savedIds.includes(Number(item.id)));
    try {
      const response = accountId
        ? await transactionService.getWishlist()
        : { data: [] };
      const backendItems = response.data || [];
      const backendIds = new Set(backendItems.map((item) => Number(item.id)));
      setItems([
        ...backendItems,
        ...demoItems.filter((item) => !backendIds.has(Number(item.id))),
      ]);
    } catch (err) {
      setItems(demoItems);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  async function handleRemove(artworkId) {
    if (SEED_ARTWORKS.some((item) => item.id === artworkId)) {
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(saved.filter((id) => id !== artworkId)));
      setItems((prev) => prev.filter((item) => item.id !== artworkId));
      dispatch(showToast('Removed from wishlist'));
      return;
    }
    try {
      await transactionService.toggleWishlist(artworkId);
      dispatch(showToast('Removed from wishlist'));
      setItems((prev) => prev.filter((item) => item.id !== artworkId));
    } catch (err) {
      dispatch(showToast(err?.response?.data?.message || 'Unable to remove from wishlist', 'error'));
    }
  }

  async function handlePurchase(artworkId) {
    if (SEED_ARTWORKS.some((item) => item.id === artworkId)) {
      const purchased = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]');
      localStorage.setItem(
        'artify_demo_purchases',
        JSON.stringify(purchased.includes(artworkId) ? purchased : [...purchased, artworkId])
      );
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(saved.filter((id) => id !== artworkId)));
      dispatch(showToast('Artwork acquired and moved to your Vault!'));
      setSelectedArtwork(null);
      loadWishlist();
      return;
    }
    try {
      await transactionService.purchaseArtwork(artworkId);
      dispatch(showToast('Artwork acquired and moved to your Vault!'));
      setSelectedArtwork(null);
      loadWishlist();
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Purchase failed', 'error'));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2 font-display">
              <BookmarkIcon className="w-4 h-4" />
              <span>Saved Creations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Saved Wishlist
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-xl">
              Keep track of original digital pieces you love and acquire them when ready.
            </p>
          </div>

          {items.length > 0 && (
            <span className="text-xs font-semibold text-slate-400">
              {items.length} {items.length === 1 ? 'artwork' : 'artworks'} saved
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-medium">Loading saved artworks...</p>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
              <BookmarkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display mb-2">
              Your Collection Starts Here
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
              Save artworks you love and come back to them anytime. Keep an eye on editions and acquire original creations.
            </p>
            <Link to="/marketplace" className="btn btn-primary py-3 px-7 text-sm font-bold shadow-md shadow-indigo-600/25">
              Explore Artwork →
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onClick={() => setSelectedArtwork(artwork)}
                onWishlist={() => handleRemove(artwork.id)}
                isWishlisted={true}
                role={auth?.role}
              />
            ))}
          </div>
        )}
      </div>

      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          role={auth?.role}
          onWishlist={() => handleRemove(selectedArtwork.id)}
          isWishlisted={true}
          onBuy={handlePurchase}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
