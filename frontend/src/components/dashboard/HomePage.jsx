import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarketplace, updateItem } from '../../store/slices/artworkSlice';
import * as artworkService from '../../services/artworkService';
import * as transactionService from '../../services/transactionService';
import { showToast } from '../../store/slices/uiSlice';
import ArtworkCard from '../artwork/ArtworkCard';
import ArtworkDetailModal from '../artwork/ArtworkDetailModal';
import { SEED_ARTWORKS, FEATURED_ARTISTS } from '../../data/seedArtworks';
import {
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  WalletIcon,
} from '../common/Icons';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.artwork);
  const auth = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('All');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState(() => JSON.parse(
    localStorage.getItem('artify_demo_like_counts') || '{}'
  ));
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [purchasedIds, setPurchasedIds] = useState(() => new Set(
    JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]').map(Number)
  ));

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

  // Combine backend items with seed items if backend has few/no artworks
  const displayItems = (items.length > 0 ? items : SEED_ARTWORKS).map((item) =>
    {
      const withCount = likeCounts[item.id] == null ? item : { ...item, likeCount: likeCounts[item.id] };
      return purchasedIds.has(Number(item.id)) ? { ...withCount, availabilityStatus: 'SOLD' } : withCount;
    }
  ).filter((item) => !new Set(
    JSON.parse(localStorage.getItem('artify_demo_hidden') || '[]').map(Number)
  ).has(Number(item.id)) && item.availabilityStatus !== 'HIDDEN');
  const orderedItems = [...displayItems].sort((a, b) => {
    const aSold = a.availabilityStatus === 'SOLD' ? 1 : 0;
    const bSold = b.availabilityStatus === 'SOLD' ? 1 : 0;
    return aSold - bSold;
  });

  // Filter by category tab
  const categories = ['All', '3D Surrealism', 'Cyberpunk', 'Generative', 'Minimalist', 'Concept Art'];
  const filteredArtworks =
    activeTab === 'All'
      ? orderedItems.slice(0, 6)
      : orderedItems.filter((art) => art.category === activeTab).slice(0, 6);

  const isCatalogUnavailable = orderedItems.length === 0
    || orderedItems.every((artwork) => artwork.availabilityStatus === 'SOLD');
  // Spotlight the most-liked available artwork. If every artwork is sold or hidden,
  // show the artist with the highest follower count instead of a purchasable fallback.
  const heroArtwork = [...orderedItems]
    .filter((artwork) => artwork.availabilityStatus !== 'SOLD')
    .sort((a, b) => Number(b.likeCount || 0) - Number(a.likeCount || 0))[0]
    || null;
  const salesByArtist = displayItems.reduce((totals, artwork) => {
    if (!purchasedIds.has(Number(artwork.id)) && artwork.availabilityStatus !== 'SOLD') return totals;
    const portfolioId = String(artwork.artistPortfolioId || artwork.artistId || '');
    totals[portfolioId] = (totals[portfolioId] || 0) + Number(artwork.price || 0);
    return totals;
  }, {});
  const topArtistEntry = Object.entries(salesByArtist)
    .sort(([, totalA], [, totalB]) => totalB - totalA)[0];
  const topArtistId = topArtistEntry?.[0];
  const salesArtist = topArtistId
    ? FEATURED_ARTISTS.find((artist) => String(artist.id) === topArtistId)
      || (() => {
        const artwork = displayItems.find(
          (item) => String(item.artistPortfolioId || item.artistId) === topArtistId
        );
        return artwork ? {
          id: artwork.artistPortfolioId || artwork.artistId,
          name: artwork.artistName || 'Featured artist',
        } : null;
      })()
    : null;
  const topFollowerArtist = [...FEATURED_ARTISTS]
    .sort((a, b) => Number(b.followerCount || 0) - Number(a.followerCount || 0))[0];
  const topArtist = isCatalogUnavailable
    ? topFollowerArtist
    : salesArtist || topFollowerArtist;

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
      // Keep modal open
    }
  };

  const handleLike = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') return;
    if (!auth?.token) {
      navigate('/login');
      return;
    }
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
        next.add(artworkId);
        return next;
      });
    }
    const nextLiked = !likedIds.has(artworkId);
    const currentArtwork = displayItems.find((item) => item.id === artworkId);
    const nextCount = Math.max(0, Number(likeCounts[artworkId] ?? currentArtwork?.likeCount ?? 0) + (nextLiked ? 1 : -1));
    const stored = { ...likeCounts, [artworkId]: nextCount };
    localStorage.setItem('artify_demo_like_counts', JSON.stringify(stored));
    setLikeCounts(stored);
    setSelectedArtwork((current) => (current?.id === artworkId ? { ...current, likeCount: nextCount } : current));
  };

  const handleWishlist = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') return;
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    if (isPreviewArtwork(artworkId)) {
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      const next = saved.includes(artworkId)
        ? saved.filter((id) => id !== artworkId)
        : [...saved, artworkId];
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(next));
      setWishlistIds(new Set(next));
      dispatch(showToast(next.includes(artworkId) ? 'Saved to wishlist' : 'Removed from wishlist'));
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
      dispatch(showToast(action === 'removed' ? 'Removed from wishlist' : 'Saved to wishlist'));
    } catch (e) {
      dispatch(showToast(e?.response?.data?.message || 'Unable to update wishlist', 'error'));
    }
  };

  const handlePurchase = async (artworkId) => {
    if (auth?.role === 'DIGITAL_ARTIST') {
      dispatch(showToast('Artists cannot purchase artworks', 'error'));
      return;
    }
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    if (isPreviewArtwork(artworkId)) {
      const purchased = JSON.parse(localStorage.getItem('artify_demo_purchases') || '[]');
      if (!purchased.includes(artworkId)) {
        const nextPurchased = [...purchased, artworkId];
        localStorage.setItem('artify_demo_purchases', JSON.stringify(nextPurchased));
        setPurchasedIds(new Set(nextPurchased.map(Number)));
      }
      const saved = JSON.parse(localStorage.getItem('artify_demo_wishlist') || '[]');
      localStorage.setItem('artify_demo_wishlist', JSON.stringify(saved.filter((id) => id !== artworkId)));
      dispatch(showToast('Artwork added to your Vault'));
      setSelectedArtwork(null);
      return;
    }
    try {
      await transactionService.purchaseArtwork(artworkId);
      dispatch(showToast('Artwork successfully acquired! Added to your Vault.'));
      setSelectedArtwork(null);
      dispatch(fetchMarketplace({}));
    } catch (error) {
      dispatch(showToast(error?.response?.data?.message || 'Purchase failed', 'error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>The Premier Digital Art Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight font-display">
                Discover <br className="hidden sm:inline" />
                Digital Art <br className="hidden sm:inline" />
                <span className="text-indigo-600">That Inspires.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                A curated marketplace connecting visionary digital artists with discerning collectors.
                Own authentic digital masterpieces with verified provenance and zero gas fees.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/marketplace"
                  className="btn btn-primary text-base py-3.5 px-7 shadow-lg shadow-indigo-600/25 group"
                >
                  <span>Explore Artworks</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#featured-artists"
                  className="btn btn-secondary text-base py-3.5 px-6 border border-slate-200"
                >
                  Discover Artists
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">2,400+</span>
                  <span className="text-xs text-slate-500 font-medium">Curated Artworks</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">850+</span>
                  <span className="text-xs text-slate-500 font-medium">Verified Creators</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">$1.8M</span>
                  <span className="text-xs text-slate-500 font-medium">Collector Volume</span>
                </div>
              </div>
            </div>

            {/* Right Hero Spotlight Card */}
            <div className="lg:col-span-5 relative">
              <div
                className={`relative rounded-3xl overflow-hidden art-card border-slate-200/90 shadow-2xl bg-white group ${
                  isCatalogUnavailable ? 'cursor-pointer' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (isCatalogUnavailable && topArtist) {
                    navigate(`/artists/${topArtist.id || topArtist.artistPortfolioId}`);
                  } else {
                    handleCardClick(heroArtwork);
                  }
                }}
              >
                <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-slate-100">
                  {isCatalogUnavailable && topArtist ? (
                    <>
                      <img
                        src={topArtist.avatar || topArtist.artistAvatar}
                        alt={topArtist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/85 via-indigo-900/15 to-indigo-950/35" />
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(14)].map((_, index) => (
                          <span
                            key={index}
                            className="celebration-sparkle"
                            style={{
                              left: `${8 + ((index * 31) % 84)}%`,
                              top: `${12 + ((index * 47) % 70)}%`,
                              animationDelay: `${(index % 5) * 0.22}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white celebration-float">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                          Highest-followed artist
                        </p>
                        <h3 className="mt-2 text-3xl font-extrabold font-display">
                          {topArtist.name}
                        </h3>
                        <p className="mt-1 text-sm text-indigo-100">
                          The artist with the largest collector following
                        </p>
                      </div>
                    </>
                  ) : (
                    <img
                      src={heroArtwork.mediaUrl}
                      alt={heroArtwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-category backdrop-blur-md bg-white/90 shadow-sm">
                      {isCatalogUnavailable ? 'Celebration Spotlight' : 'Spotlight of the Week'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`badge backdrop-blur-md bg-white/90 shadow-sm ${
                      isCatalogUnavailable ? 'text-amber-700 border border-amber-200' : 'badge-available'
                    }`}>
                      {isCatalogUnavailable ? 'Congratulations' : (heroArtwork.availabilityStatus || 'Available')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {isCatalogUnavailable && topArtist ? (
                    <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Congratulations
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-950">
                        {topArtist.name} is the artist with the highest follower count on ArtifyHub.
                      </p>
                      <Link
                        to={`/artists/${topArtist.id || topArtist.artistPortfolioId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                      >
                        View artist profile →
                      </Link>
                    </div>
                  ) : null}
                  {isCatalogUnavailable && topArtist ? (
                    <Link
                      to={`/artists/${topArtist.id || topArtist.artistPortfolioId}`}
                      onClick={(event) => event.stopPropagation()}
                      className="btn btn-primary w-full py-3"
                    >
                      View {topArtist.name}&apos;s profile →
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-indigo-600 transition-colors">
                          {heroArtwork.title}
                        </h3>
                        <span className="text-xl font-bold text-slate-900 font-display">
                          ${Number(heroArtwork.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {(heroArtwork.artistName || 'E').charAt(0)}
                          </div>
                          <span className="font-medium text-slate-700">{heroArtwork.artistName}</span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                          View Details →
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative Subtle Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl -z-10 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED ARTWORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block font-display">
              Curated Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight">
              Featured Artworks
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={handleCardClick}
              onLike={handleLike}
              onWishlist={handleWishlist}
              isLiked={likedIds.has(artwork.id)}
              isWishlisted={wishlistIds.has(artwork.id)}
              role={auth?.role}
            />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/marketplace"
            className="btn btn-secondary py-3 px-8 text-sm font-bold border-slate-300 shadow-sm"
          >
            Browse All Marketplace Artworks →
          </Link>
        </div>
      </section>

      {/* 3. FEATURED ARTISTS SPOTLIGHT */}
      <section id="featured-artists" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block font-display">
            The Creative Vanguard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight mb-4">
            Meet the Artists
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Follow pioneering creators pushing the boundaries of generative algorithms, 3D surrealism, and concept design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              className="art-card p-6 flex flex-col justify-between bg-white border border-slate-200/80"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">{artist.name}</h3>
                    <span className="text-xs text-indigo-600 font-semibold">{artist.handle}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{artist.specialization}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
                  {artist.bio}
                </p>

                {/* 3 Artwork Previews */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {artist.artworkPreviews.map((previewUrl, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Followers</span>
                  <span className="text-sm font-bold text-slate-900 font-display">{artist.followerCount}</span>
                </div>
                <Link
                  to={`/artists/${artist.id}`}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY ARTIFYHUB VALUE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 block">
              Built for Modern Digital Art
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight font-display tracking-tight text-white mb-4">
              A Marketplace Designed for Integrity and Excellence
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We eliminate technical friction so artists can build meaningful careers and collectors can curate with absolute confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Verified Provenance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every transaction issues an immutable certificate of authenticity directly to the collector's vault with timestamped ownership logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <WalletIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Seamless Digital Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Private, high-resolution storage for your acquired collection with instant certificate inspection and exportable proof of ownership.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Creator Empowerment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero gas fees, customizable portfolio pages, direct follower communication, and immediate settlement on secondary sales.
              </p>
            </div>
          </div>

          {/* Background Decorative Ambient Radial */}
          <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Modal Detail */}
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
          onBuy={handlePurchase}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
