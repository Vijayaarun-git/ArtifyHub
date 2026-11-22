import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  fetchMarketplace,
  updateItem
} from '../../store/slices/artworkSlice';

import * as artworkService from '../../services/artworkService';
import * as transactionService from '../../services/transactionService';
import { showToast } from '../../store/slices/uiSlice';

import ArtworkCard from './ArtworkCard';
import ArtworkForm from './ArtworkForm';
import ArtworkDetailModal from './ArtworkDetailModal';
import SearchFilterBar from '../common/SearchFilterBar';
import EmptyState from '../common/EmptyState';
import { SEED_ARTWORKS } from '../../data/seedArtworks';
import { SparklesIcon } from '../common/Icons';

export default function ArtworkList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { items = [], loading } = useSelector((state) => state.artwork);
  const auth = useSelector((state) => state.auth);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-asc' | 'price-desc' | 'most-liked'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE'
  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState(() => JSON.parse(
    localStorage.getItem('artify_demo_like_counts') || '{}'
  ));
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const isPreviewArtwork = (artworkId) => !items.some((item) => item.id === artworkId);

  useEffect(() => {
    dispatch(fetchMarketplace({}));
  }, [dispatch]);

  useEffect(() => {
    if (!auth?.token) {
      setWishlistIds(new Set());
      return;
    }
    transactionService.getWishlist()
      .then(({ data }) => {
        const savedIds = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
        setWishlistIds(new Set([...(data || []).map((item) => item.id), ...savedIds]));
      })
      .catch(() => setWishlistIds(new Set()));
  }, [auth?.token]);

  // Sync with URL query parameter changes
  useEffect(() => {
    const q = searchParams.get('search');
    setSearchTerm(q || '');
    const c = searchParams.get('category');
    setSelectedCategory(c || 'All');
  }, [searchParams]);

  // Combined source list
  const purchasedIds = new Set(JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]'));
  const hiddenIds = new Set(JSON.parse(localStorage.getItem('artify_demo_hidden') || '[]').map(Number));
  const sourceArtworks = (items.length > 0 ? items : SEED_ARTWORKS)
    .filter((item) => !hiddenIds.has(Number(item.id)) && item.availabilityStatus !== 'HIDDEN')
    .map((item) =>
    {
      const withCount = likeCounts[item.id] == null ? item : { ...item, likeCount: likeCounts[item.id] };
      return purchasedIds.has(item.id) ? { ...withCount, availabilityStatus: 'SOLD' } : withCount;
    }
  );
  sourceArtworks.sort((a, b) => {
    const aSold = a.availabilityStatus === 'SOLD' ? 1 : 0;
    const bSold = b.availabilityStatus === 'SOLD' ? 1 : 0;
    return aSold - bSold;
  });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(sourceArtworks.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [sourceArtworks]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...sourceArtworks];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (art) =>
          art.title?.toLowerCase().includes(q) ||
          art.description?.toLowerCase().includes(q) ||
          art.artistName?.toLowerCase().includes(q) ||
          art.tags?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((art) => art.category === selectedCategory);
    }

    // Status filter
    if (statusFilter === 'AVAILABLE') {
      result = result.filter((art) => art.availabilityStatus === 'AVAILABLE');
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'most-liked') {
      result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else {
      // Newest
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    // Availability is the primary marketplace ordering: sold works always
    // remain below available works regardless of the selected secondary sort.
    result.sort((a, b) => {
      const aSold = a.availabilityStatus === 'SOLD' ? 1 : 0;
      const bSold = b.availabilityStatus === 'SOLD' ? 1 : 0;
      return aSold - bSold;
    });

    return result;
  }, [sourceArtworks, searchTerm, selectedCategory, statusFilter, sortBy]);

  const handleCardClick = async (artwork) => {
    setSelectedArtwork(artwork);
    setIsFollowing(false);
    if (artwork.artistPortfolioId && auth?.role !== 'DIGITAL_ARTIST' && auth?.token) {
      transactionService
        .getFollowStatus(artwork.artistPortfolioId)
        .then((res) => setIsFollowing(Boolean(res?.data?.isFollowing)))
        .catch(() => {});
    }

    try {
      const res = await artworkService.recordView(artwork.id);
      if (res?.data) {
        const updated = { ...artwork, ...res.data };
        dispatch(updateItem(updated));
        setSelectedArtwork(updated);
      }
    } catch (e) {
      // fallback
    }
  };

  const handleLike = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') return;
    try {
      const res = await artworkService.toggleLike(artworkId);
      if (res?.data) {
        dispatch(updateItem(res.data));
        setSelectedArtwork((curr) => (curr?.id === artworkId ? res.data : curr));
      }
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(artworkId)) next.delete(artworkId);
        else next.add(artworkId);
        return next;
      });
    } catch (e) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(artworkId)) next.delete(artworkId);
        else next.add(artworkId);
        return next;
      });
    }
    const nextLiked = !likedIds.has(artworkId);
    const currentArtwork = sourceArtworks.find((item) => item.id === artworkId);
    const nextCount = Math.max(0, Number(likeCounts[artworkId] ?? currentArtwork?.likeCount ?? 0) + (nextLiked ? 1 : -1));
    const stored = { ...likeCounts, [artworkId]: nextCount };
    localStorage.setItem('artify_demo_like_counts', JSON.stringify(stored));
    setLikeCounts(stored);
    setSelectedArtwork((current) => (current?.id === artworkId ? { ...current, likeCount: nextCount } : current));
  };

  const handleWishlist = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') return;
    if (isPreviewArtwork(artworkId)) {
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      const next = saved.includes(artworkId)
        ? saved.filter((id) => id !== artworkId)
        : [...saved, artworkId];
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(next));
      setWishlistIds(new Set(next));
      dispatch(showToast(next.includes(artworkId) ? 'Added to wishlist' : 'Removed from wishlist'));
      return;
    }
    try {
      const res = await transactionService.toggleWishlist(artworkId);
      const action = res?.data?.action;
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (action === 'removed') next.delete(artworkId);
        else next.add(artworkId);
        return next;
      });
      dispatch(showToast(action === 'removed' ? 'Removed from wishlist' : 'Added to wishlist'));
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Unable to update wishlist', 'error'));
    }
  };

  const handlePurchase = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') {
      dispatch(showToast('Artists cannot purchase artworks', 'error'));
      return;
    }
    if (isPreviewArtwork(artworkId)) {
      const purchased = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]');
      if (!purchased.includes(artworkId)) {
        localStorage.setItem('artify_demo_purchases', JSON.stringify([...purchased, artworkId]));
      }
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(saved.filter((id) => id !== artworkId)));
      dispatch(showToast('Artwork added to your Vault'));
      setSelectedArtwork(null);
      return;
    }
    try {
      await transactionService.purchaseArtwork(artworkId);
      dispatch(showToast('Artwork added to your vault'));
      setSelectedArtwork(null);
      dispatch(fetchMarketplace({}));
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Purchase failed', 'error'));
    }
  };

  const handleDelete = async (artwork) => {
    if (!window.confirm(`Are you sure you want to remove "${artwork.title}" from the marketplace?`)) return;
    try {
      await artworkService.deleteArtwork(artwork.id);
      dispatch(showToast('Artwork removed'));
      setSelectedArtwork(null);
      dispatch(fetchMarketplace({}));
    } catch (e) {
      dispatch(showToast('Unable to delete artwork', 'error'));
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') newParams.delete('category');
    else newParams.set('category', category);
    setSearchParams(newParams);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (!term) newParams.delete('search');
    else newParams.set('search', term);
    setSearchParams(newParams);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStatusFilter('ALL');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2 font-display">
              <SparklesIcon className="w-4 h-4" />
              <span>Curated Art Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Explore Digital Art
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-xl">
              Browse original digital creations, generative algorithms, and concept art from certified artists worldwide.
            </p>
          </div>

          {auth?.role === 'DIGITAL_ARTIST' && (
            <button
              type="button"
              onClick={() => setShowUploadForm(true)}
              className="btn btn-primary py-3 px-6 shadow-md shadow-indigo-600/20"
            >
              + Upload New Artwork
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <SearchFilterBar
          placeholder="Search by title, artist, keyword or style..."
          onSearch={handleSearch}
          filterOptions={categories.filter((c) => c !== 'All')}
          selectedFilter={selectedCategory === 'All' ? '' : selectedCategory}
          onFilter={(cat) => handleCategorySelect(cat || 'All')}
        />

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Sort & Status Filters */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {/* Status toggle */}
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'AVAILABLE' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Available
              </button>
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="most-liked">Most Liked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || selectedCategory !== 'All' || statusFilter !== 'ALL') && (
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-500">
            <span>Showing {filteredItems.length} results</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="art-card p-0 overflow-hidden">
                <div className="skeleton aspect-[4/3] w-full"></div>
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <div className="skeleton h-6 w-1/3"></div>
                    <div className="skeleton h-6 w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            heading="No artworks found"
            description="We couldn't find artworks matching your search or filters. Try adjusting your query or resetting filters."
            actionText="Clear Search & Filters"
            onAction={handleClearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onClick={handleCardClick}
                onLike={handleLike}
                onWishlist={handleWishlist}
                isLiked={likedIds.has(artwork.id)}
                isWishlisted={wishlistIds.has(artwork.id)}
                role={auth?.role}
                onEdit={(art) => setEditingArtwork(art)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {(showUploadForm || editingArtwork) && (
        <ArtworkForm
          artwork={editingArtwork}
          onClose={() => {
            setShowUploadForm(false);
            setEditingArtwork(null);
          }}
          onCreated={(savedArtwork) => {
            setShowUploadForm(false);
            setEditingArtwork(null);
            dispatch(fetchMarketplace({}));
          }}
        />
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          role={auth?.role}
          onLike={handleLike}
          onWishlist={handleWishlist}
          isWishlisted={wishlistIds.has(selectedArtwork.id)}
          onViewPortfolio={(portfolioId) => {
            setSelectedArtwork(null);
            navigate(`/artists/${portfolioId}`);
          }}
          isFollowing={isFollowing}
          canFollow={String(selectedArtwork.artistId) !== String(auth?.accountid)}
          onBuy={handlePurchase}
          onClose={() => setSelectedArtwork(null)}
          onEdit={(art) => {
            setSelectedArtwork(null);
            setEditingArtwork(art);
          }}
          onDelete={(art) => {
            handleDelete(art);
          }}
        />
      )}
    </div>
  );
}